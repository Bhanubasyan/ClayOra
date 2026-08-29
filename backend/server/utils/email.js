const parseSender = () => {
  const configuredSender = process.env.EMAIL_FROM || process.env.BREVO_SENDER_EMAIL;
  if (!configuredSender) {
    throw new Error("Email is not configured. Set BREVO_API_KEY and EMAIL_FROM.");
  }

  const senderMatch = configuredSender.match(/^(.*?)\s*<([^>]+)>$/);
  return senderMatch
    ? { name: senderMatch[1].trim() || "ClayOra", email: senderMatch[2].trim() }
    : { name: process.env.BREVO_SENDER_NAME || "ClayOra", email: configuredSender.trim() };
};

exports.sendEmail = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("Email is not configured. Set BREVO_API_KEY.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: parseSender(),
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Brevo email request failed (${response.status}): ${details}`);
  }

  return response.json();
};
