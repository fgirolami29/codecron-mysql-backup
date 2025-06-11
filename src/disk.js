import checkDiskSpace from 'check-disk-space';   // ESM

/**
 * Restituisce `{ free, total }` in byte.
 * Usa fs.statfs se disponibile, altrimenti check-disk-space.
 */
export async function diskUsage(root = '/') {
  // Node ≥19: statfs disponibile (più veloce, no dipendenze native)
  if (typeof process.statfs === 'function') {
    try {
      const { bfree, blocks, frsize } = await fs.promises.statfs(root);
      return { free: bfree * frsize, total: blocks * frsize };
    } catch {/* fallback */}
  }

  const { free, size } = await checkDiskSpace(root);
  return { free, total: size };
}
