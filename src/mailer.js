import nodemailer from 'nodemailer';

export function buildMailer(smtp) {
  return nodemailer.createTransport({
    host:   smtp.host,
    port:   smtp.port,
    secure: smtp.secure,          // true = TLS
    auth:   smtp.auth,            // { user, pass }  facoltativo
    pool: true,
    maxConnections: smtp.maxConnections ?? 3,
    maxMessages:    smtp.maxMessages    ?? 20,
  });
}

export async function send(mailer, { to, subject, html }) {
  await mailer.sendMail({
    from: mailer.options.auth?.user ?? 'backup@localhost',
    to, subject, html, text: subject
  });
}