import { basename } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-fs';

export async function pathToFile(path: string): Promise<File> {
  const fileName = await basename(path);
  const fileHandle = await open(path, { read: true });
  // Get file stats to know the size
  const stats = await fileHandle.stat();
  const buffer = new Uint8Array(stats.size);
  // Read the entire file
  await fileHandle.read(buffer);

  // Create a Blob
  const blob = new Blob([buffer], { type: 'application/octet-stream' });

  // Create a File object from the Blob
  const file = new File([blob], fileName, {
    type: blob.type,
    lastModified: stats.mtime ? stats.mtime.getTime() : undefined,
  });

  await fileHandle.close();

  return file;
}
