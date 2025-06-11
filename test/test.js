/* eslint-disable no-console */
import assert from 'node:assert/strict';
import { diskUsage } from '../src/disk.js';
import { scheduleBackups } from '../index.js';

/* ---------- diskUsage() ------------------------------------------------ */
const { free, total } = await diskUsage('/');
assert.ok(Number.isFinite(free)  && free  > 0,    'free space should be > 0');
assert.ok(Number.isFinite(total) && total >= free, 'total space >= free');

/* ---------- scheduleBackups() smoke test ------------------------------- */
assert.doesNotThrow(() => {
  scheduleBackups({
    databases: ['dummy'],
    cron: '* * * * *',              // cron valida
    mysql: { host: 'x', user: 'x', password: 'x' },
    directoryRoot: './.tmp',        // tmp dir locale
    maxBackups: 1,
    successEvery: 999           // disattiva mail
  });
}, 'scheduleBackups() should not throw with minimal config');

console.log('✅  All basic tests passed');
