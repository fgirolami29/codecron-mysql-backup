import { mkdir, readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import mysqldump from 'mysqldump';
import { diskUsage } from './disk.js';

const TEN_PERCENT = 0.10;
const DEFAULT_MAX_BACKUPS = 24 * 7;

export async function dumpDB({ conn, dir }) {
  await mkdir(dir, { recursive: true });
  const ts = Date.now();
  await mysqldump({
    connection: conn,
    dumpToFile: path.join(dir, `${ts}.sql`)
  });
  return ts;
}

export async function rotateDir(dir, max = DEFAULT_MAX_BACKUPS) {
  const files = (await readdir(dir)).sort();          // asc → oldest first
  while (files.length > max) {
    const oldest = files.shift();
    await unlink(path.join(dir, oldest));
  }
}

export async function pruneUntilFree(dir, root = '/') {
  const { free, total } = await diskUsage(root);
  if (free / total >= TEN_PERCENT) return;

  const files = (await readdir(dir)).sort();          // oldest first
  if (!files.length) return;
  await unlink(path.join(dir, files[0]));
  return pruneUntilFree(dir, root);
}