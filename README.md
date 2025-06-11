
# pytorchia-codecron-mysql-backup

> Zero-downtime, sequential MySQL / MariaDB dumps with cron scheduling,  
> disk-space self-healing, retention policy & SMTP alerts – ready for Node 18 +

[![](https://img.shields.io/npm/v/pytorchia-codecron-mysql-backup?style=flat-square)](https://www.npmjs.com/package/pytorchia-codecron-mysql-backup)
[![](https://img.shields.io/node/v/pytorchia-codecron-mysql-backup.svg?style=flat-square)](https://nodejs.org)
[![](https://img.shields.io/github/license/fgirolami29/codecron-mysql-backup?style=flat-square)](LICENSE)

---

## ✨ Features

| ✓ | Description |
|---|-------------|
| **Sequential multi-DB dumps** | Never run two `mysqldump` at once – next DB starts only when the previous one is OK. |
| **Pluggable cron** (`node-cron`) | Any cron expression (`'* * * * *'` etc.). |
| **Smart retention** | Keep _N_ newest dumps per DB. |
| **Automatic low-disk pruning** | Ensures at least 10 % free space (uses native `fs.statfs` or <br>`check-disk-space` fallback). |
| **SMTP pool with Nodemailer** | One TLS connection reused for every notification. |
| **Success / failure e-mails** | Optional OK/KO messages, configurable frequency. |
| **Pure options API** | No `dotenv` dependency – bring your own config loader. |
| **ESM + CommonJS** | `import { scheduleBackups }` **or** `const { scheduleBackups } = require(...)`. |
| **TypeScript ready** | Inline JSDoc types – no external `@types/*` needed. |

---

## 🛠️ Installation

```bash
npm  i  pytorchia-codecron-mysql-backup
# or
yarn add pytorchia-codecron-mysql-backup
````

---

## 🚀 Quick start

```js
import { scheduleBackups } from 'pytorchia-codecron-mysql-backup';

scheduleBackups({
  // ➊ What to dump
  databases: ['shop', 'analytics'],

  // ➋ When
  cron: '0 * * * *',               // every hour at minute 0

  // ➌ MySQL / MariaDB credentials
  mysql: { host: 'db', user: 'root', password: 'secret' },

  // ➍ Where to store
  directoryRoot: './dumps',

  // ➎ Retention
  maxBackups: 24 * 7,              // keep one week of hourly dumps

  // ➏ Notifications (optional)
  smtp: {
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    auth: { user: 'apikey', pass: process.env.SENDGRID_KEY }
  },
  notifyTo: 'ops@example.com',
  successEvery: 12                 // send an OK mail every 12 dumps
});
```

The first dump starts immediately, then repeats according to the cron
expression.  If a dump fails:

* remaining DBs **will not run** for that cycle;
* a *single* failure e-mail is sent (if SMTP is configured).

---

## 🧩 Full option reference

| Key             | Type / Default                          | Description                                           |
| --------------- | --------------------------------------- | ----------------------------------------------------- |
| `databases`     | `string[]` **(required)**               | List of DB names to dump in order.                    |
| `cron`          | `string` – `'0 * * * *'`                | Standard cron 5-field expression.                     |
| `mysql`         | `{ host, user, password }` **required** | Shared connection params; the lib appends `database`. |
| `directoryRoot` | `./dumps`                               | Root folder; one sub-folder per DB.                   |
| `maxBackups`    | `168`                                   | Max files per DB (e.g. `24 * 7`).                     |
| `smtp`          | see example                             | SMTP pool options (`host`, `port`, `secure`, `auth`). |
| `notifyTo`      | `string \| string[]`                    | Recipient(s).                                         |
| `successEvery`  | `number` – `24`                         | Send OK mail every *N* successful dumps (0 = never).  |
| `diskFreeRatio` | `0.10`                                  | Minimum free space fraction before pruning.           |

---

## 🛡️ Security tips

* Create a dedicated DB user with **`LOCK TABLES, SELECT`** only.
* Store SMTP credentials in a secrets manager / CI variable, **not** in code.
* Consider using GPG or client-side encryption for the `.sql` files.

---

## 🤝 Contributing

1. `git clone https://github.com/fgirolami29/codecron-mysql-backup.git`
2. `npm i`
3. `npm run lint && npm test`
4. PRs & issues welcome!

---

## 📜 License

MIT © PyTorchia™ Community
See [LICENSE](./LICENSE) for details.
