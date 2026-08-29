const nodemailer = require("nodemailer");

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Email is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS.");
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Set SMTP_TLS_REJECT_UNAUTHORIZED=false only for a trusted local/dev network
    // that injects a self-signed TLS certificate. Keep the production default secure.
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
    },
  });
};

exports.sendEmail = ({ to, subject, html }) => getTransporter().sendMail({
  from: process.env.EMAIL_FROM || process.env.SMTP_USER,
  to,
  subject,
  html,
});
