import { join } from '@tauri-apps/api/path';
import { basename } from '@tauri-apps/api/path';
import { type DirEntry, readDir, readFile } from '@tauri-apps/plugin-fs';
import JSZip from 'jszip';

export async function createZipFromDirectory(
  directoryPath: string,
): Promise<File> {
  const entries = await readDir(directoryPath);
  const fileName = await basename(directoryPath);
  const zip = new JSZip();
  // Ensure directory path ends with separator
  const baseDir = directoryPath.endsWith('/')
    ? directoryPath
    : `${directoryPath}/`;

  async function processEntries(parent: string, entries: DirEntry[]) {
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = await join(parent, entry.name);

      // Calculate relative path manually
      const relativePath = fullPath.startsWith(baseDir)
        ? fullPath.slice(baseDir.length)
        : fullPath;

      if (entry.isDirectory) {
        // Create directory in zip
        zip.folder(relativePath);
        await processEntries(fullPath, await readDir(fullPath));
      } else {
        const content = await readFile(fullPath);
        zip.file(relativePath, content);
      }
    }
  }

  await processEntries(directoryPath, entries);

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return new File([zipBlob], `${fileName}.zip`, { type: 'application/zip' });
}
