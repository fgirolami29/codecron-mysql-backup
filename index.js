
import cron from 'node-cron';
import path from 'node:path';
import { dumpDB, rotateDir, pruneUntilFree } from './src/backup.js';
import { buildMailer, send } from './src/mailer.js';

/**
 * @typedef {Object} BackupOptions
 * @prop {string[]}          databases
 * @prop {string}            cron            ('0 * * * *')
 * @prop {Object}            mysql           { host, user, password }
 * @prop {string}            directoryRoot   './dumps'
 * @prop {number}            maxBackups      168
 * @prop {Object}            smtp            { host, port, secure, auth }
 * @prop {string|string[]}   notifyTo
 * @prop {number}            successEvery    invia OK mail ogni N dump
 */

export function scheduleBackups(opts /** @type {BackupOptions} */) {
    const {
        databases,
        cron: cronExpr = '0 * * * *',
        mysql,
        directoryRoot = './dumps',
        maxBackups = 168,
        smtp,
        notifyTo,
        successEvery = 24,
    } = opts;

    const mailer = smtp ? buildMailer(smtp) : null;
    let success = 0;

    cron.schedule(cronExpr, async () => {
        for (const db of databases) {
            const dir = path.join(directoryRoot, db);
            try {
                await pruneUntilFree(dir);
                const ts = await dumpDB({ conn: { ...mysql, database: db }, dir });
                await rotateDir(dir, maxBackups);
                console.log('✔', db, new Date(ts).toISOString());

                if (mailer && ++success % successEvery === 0) {
                    await send(mailer, {
                        to: notifyTo,
                        subject: `${db} backup OK`,
                        html: `Backup completato: ${new Date(ts).toISOString()}`
                    });
                }
            } catch (err) {
                console.error('✖', db, err);
                if (mailer) {
                    await send(mailer, {
                        to: notifyTo,
                        subject: `${db} backup FAILED`,
                        html: `<pre>${err.stack ?? err}</pre>`
                    });
                }
                break;                      // fermo la catena
            }
        }
    });
}