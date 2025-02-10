import { execSync } from 'node:child_process';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import zlib from 'node:zlib';

interface PlatformInfo {
  os: string;
  arch: string;
  filename: string;
  isTgz: boolean;
}

interface GithubRelease {
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

class ProgressBar {
  private current = 0;
  private total = 0;
  private lastOutput = '';

  constructor(total: number) {
    this.total = total;
  }

  update(chunk: number): void {
    this.current += chunk;
    this.render();
  }

  private render(): void {
    const percentage = Math.round((this.current / this.total) * 100);
    const width = process.stdout.columns || 80;
    const barWidth = width - 30;
    const filledWidth = Math.round((percentage / 100) * barWidth);
    const emptyWidth = barWidth - filledWidth;

    const filledBar = '='.repeat(filledWidth);
    const emptyBar = ' '.repeat(emptyWidth);
    const output = `Downloading: [${filledBar}>${emptyBar}] ${percentage}%`;

    if (output !== this.lastOutput) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(output);
      this.lastOutput = output;
    }
  }

  finish(): void {
    process.stdout.write('\n');
  }
}

function formatUTCDate(date: Date): string {
  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function getPlatformInfo(): PlatformInfo {
  const os = process.platform;
  const arch = process.arch;

  let filename = 'cloudflared';
  let isTgz = false;

  switch (os) {
    case 'win32':
      filename = `cloudflared-windows-${arch === 'x64' ? 'amd64' : '386'}.exe`;
      break;
    case 'darwin':
      filename = `cloudflared-darwin-${arch === 'x64' ? 'amd64' : 'arm64'}.tgz`;
      isTgz = true;
      break;
    case 'linux': {
      let archName: string = arch;
      switch (arch) {
        case 'x64':
          archName = 'amd64';
          break;
        case 'ia32':
          archName = '386';
          break;
        case 'arm':
          archName = 'arm';
          break;
        case 'arm64':
          archName = 'arm64';
          break;
        default:
          throw new Error(`Unsupported architecture: ${arch}`);
      }
      filename = `cloudflared-linux-${archName}`;
      break;
    }
    default:
      throw new Error(`Unsupported platform: ${os}`);
  }

  return { os, arch, filename, isTgz };
}

async function fetchLatestRelease(): Promise<GithubRelease> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/cloudflare/cloudflared/releases/latest',
      headers: {
        'User-Agent': 'cloudflared-script',
        Accept: 'application/vnd.github.v3+json',
      },
    };

    const req = https.get(options, (res) => {
      if (res.statusCode !== 200) {
        reject(
          new Error(`GitHub API responded with status code ${res.statusCode}`),
        );
        return;
      }

      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          resolve(release);
        } catch (err) {
          reject(new Error(`Failed to parse GitHub API response: ${err}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Failed to fetch release info: ${error.message}`));
    });

    req.end();
  });
}

async function downloadFile(
  url: string,
  destPath: string,
  size: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const progressBar = new ProgressBar(size);
    const file = fs.createWriteStream(destPath);
    let receivedBytes = 0;

    function handleResponse(response: any) {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        console.log(`Following redirect to: ${response.headers.location}`);
        https
          .get(response.headers.location, handleResponse)
          .on('error', handleError);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        reject(
          new Error(`Server responded with status code ${response.statusCode}`),
        );
        return;
      }

      response.on('data', (chunk: Buffer) => {
        receivedBytes += chunk.length;
        file.write(chunk);
        progressBar.update(chunk.length);
      });

      response.on('end', () => {
        file.end();
        if (receivedBytes === size) {
          progressBar.finish();
          // Verify the file exists and has the correct size
          if (fs.existsSync(destPath) && fs.statSync(destPath).size === size) {
            resolve();
          } else {
            reject(
              new Error('Downloaded file size mismatch or file not found'),
            );
          }
        } else {
          reject(
            new Error(
              `Size mismatch: expected ${size} bytes but received ${receivedBytes} bytes`,
            ),
          );
        }
      });

      response.on('error', handleError);
    }

    function handleError(error: Error) {
      file.close();
      fs.unlink(destPath, () => {});
      reject(new Error(`Download failed: ${error.message}`));
    }

    const req = https.get(url, handleResponse);
    req.on('error', handleError);
    req.end();

    file.on('error', (error) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(new Error(`File write error: ${error.message}`));
    });
  });
}

async function unpackTgz(tgzPath: string, destDir: string): Promise<string> {
  console.log('Unpacking tgz file...');

  const extractedPath = path.join(destDir, 'cloudflared');
  const tempTarPath = path.join(destDir, 'temp.tar');

  return new Promise((resolve, reject) => {
    // Step 1: Decompress .gz to get tar file
    const gunzip = zlib.createGunzip();
    const source = fs.createReadStream(tgzPath);
    const tarFile = fs.createWriteStream(tempTarPath);

    source
      .pipe(gunzip)
      .pipe(tarFile)
      .on('finish', async () => {
        try {
          // Step 2: Read and process the tar file
          const tarData = await fs.promises.readFile(tempTarPath);

          // TAR format: Each file is preceded by a 512-byte header
          // followed by the file content padded to a 512-byte boundary
          let offset = 0;

          while (offset < tarData.length - 512) {
            // Read header block
            const header = tarData.slice(offset, offset + 512);

            // Get filename (100 bytes) from header
            const fileName = header
              .slice(0, 100)
              .toString('utf8')
              .replace(/\0/g, '')
              .trim();

            // Get file size (12 bytes) from header - octal string
            const sizeStr = header
              .slice(124, 136)
              .toString('utf8')
              .replace(/\0/g, '')
              .trim();
            const fileSize = Number.parseInt(sizeStr, 8);

            // Skip empty/invalid blocks
            if (fileSize === 0 || !fileName) {
              offset += 512;
              continue;
            }

            // If this is the cloudflared binary
            if (fileName.endsWith('cloudflared')) {
              // Extract file content
              const fileContent = tarData.slice(
                offset + 512,
                offset + 512 + fileSize,
              );

              // Write the binary file
              await fs.promises.writeFile(extractedPath, fileContent);

              // Cleanup
              await fs.promises.unlink(tempTarPath);

              // Make binary executable
              await fs.promises.chmod(extractedPath, 0o755);

              resolve(extractedPath);
              return;
            }

            // Move to next file
            // Skip header (512 bytes) and file content (padded to 512 bytes)
            offset += 512 + Math.ceil(fileSize / 512) * 512;
          }

          throw new Error('cloudflared binary not found in archive');
        } catch (error) {
          // Cleanup on error
          fs.unlink(tempTarPath, () => {});
          fs.unlink(extractedPath, () => {});
          reject(new Error(`Extraction failed: ${error.message}`));
        }
      })
      .on('error', (error) => {
        // Cleanup on error
        fs.unlink(tempTarPath, () => {});
        fs.unlink(extractedPath, () => {});
        reject(new Error(`Decompression failed: ${error.message}`));
      });

    source.on('error', (error) => {
      // Cleanup on error
      fs.unlink(tempTarPath, () => {});
      fs.unlink(extractedPath, () => {});
      reject(new Error(`Failed to read source file: ${error.message}`));
    });
  });
}

async function main() {
  const tmpDir = path.join(process.cwd(), 'tmp');

  try {
    const startTime = formatUTCDate(new Date());
    console.log(`Current Date and Time (UTC): ${startTime}`);
    console.log(
      `Current User's Login: ${process.env.USER || process.env.USERNAME || 'unknown'}`,
    );

    // Get platform information
    const platformInfo = getPlatformInfo();
    console.log('Detected platform:', platformInfo);

    // Fetch latest release information
    console.log('Fetching latest release information...');
    const latestRelease = await fetchLatestRelease();
    console.log(`Latest release: ${latestRelease.tag_name}`);

    // Find the matching asset
    const asset = latestRelease.assets.find(
      (a) => a.name === platformInfo.filename,
    );
    if (!asset) {
      throw new Error(
        `Could not find matching asset for platform: ${platformInfo.filename}`,
      );
    }

    // Create temporary directory for downloads
    console.log(`Creating temporary directory: ${tmpDir}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    // Download the binary
    const downloadPath = path.join(tmpDir, platformInfo.filename);
    console.log(`Downloading ${asset.name} to ${downloadPath}`);
    console.log(`URL: ${asset.browser_download_url}`);
    await downloadFile(asset.browser_download_url, downloadPath, asset.size);

    // Verify the downloaded file
    if (!fs.existsSync(downloadPath)) {
      throw new Error(`Downloaded file not found at ${downloadPath}`);
    }
    console.log(
      `File downloaded successfully: ${fs.statSync(downloadPath).size} bytes`,
    );

    // Handle tgz unpacking if needed
    let binaryPath = downloadPath;
    if (platformInfo.isTgz) {
      console.log('Extracting tgz archive...');
      binaryPath = await unpackTgz(downloadPath, tmpDir);
    }

    // Get the rust target triple for renaming
    console.log('Getting Rust target triple...');
    const rustInfo = execSync('rustc -vV', { encoding: 'utf8' });
    const targetTripleMatch = /host: (\S+)/g.exec(rustInfo);
    if (!targetTripleMatch) {
      throw new Error('Failed to determine platform target triple');
    }
    const targetTriple = targetTripleMatch[1];

    // Create binaries directory if it doesn't exist
    const binariesDir = path.join(
      process.cwd(),
      'src-tauri',
      'binaries',
      'cloudflared',
    );
    fs.mkdirSync(binariesDir, { recursive: true });

    // Copy and rename the binary
    const extension = process.platform === 'win32' ? '.exe' : '';
    const finalPath = path.join(
      binariesDir,
      `cloudflared-${targetTriple}${extension}`,
    );

    console.log(`Copying binary to ${finalPath}`);
    fs.copyFileSync(binaryPath, finalPath);
    fs.chmodSync(finalPath, 0o755); // Make the binary executable

    console.log('Binary processed and renamed successfully:', finalPath);

    // Cleanup
    console.log('Cleaning up temporary files...');
    fs.rmSync(tmpDir, { recursive: true, force: true });

    const endTime = formatUTCDate(new Date());
    console.log(`Script completed at: ${endTime}`);
  } catch (error) {
    console.error('Error:', error);
    // Cleanup on error
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    process.exit(1);
  }
}

main();
