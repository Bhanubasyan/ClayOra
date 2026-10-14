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
    // Email reliability fix: preserve the Brevo response in server logs without exposing API keys.
    const error = new Error(`Brevo email request failed (${response.status}): ${details}`);
    error.code = "EMAIL_PROVIDER_REJECTED";
    error.providerStatus = response.status;
    throw error;
  }

  return response.json();
};

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

exports.sendOrderConfirmation = async ({ order, customer }) => {
  if (!customer?.email) throw new Error("Customer email is missing");

  const itemRows = order.orderItems.map((item) => {
    const productName = item.product?.name || "ClayOra product";
    const variant = item.variantName ? ` <small>(${escapeHtml(item.variantName)})</small>` : "";
    return `<tr><td style="padding:10px 0;border-bottom:1px solid #eadfd7">${escapeHtml(productName)}${variant}</td><td style="padding:10px;text-align:center;border-bottom:1px solid #eadfd7">${item.quantity}</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #eadfd7">Rs. ${Number(item.price * item.quantity).toFixed(2)}</td></tr>`;
  }).join("");
  const address = order.deliveryAddress || {};
  const addressText = [address.addressLine1, address.addressLine2, address.landmark, address.city, address.state, address.postalCode, address.country]
    .filter(Boolean).map(escapeHtml).join(", ");

  return exports.sendEmail({
    to: customer.email,
    subject: `ClayOra order confirmed - ${order._id}`,
    html: `<div style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#3f2b23"><h1 style="color:#a64f2f">Thank you for your order</h1><p>Hello ${escapeHtml(customer.name || address.recipientName || "there")},</p><p>Your ClayOra order has been confirmed and is being prepared.</p><p><strong>Order ID:</strong> ${escapeHtml(order._id)}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>${itemRows}</tbody></table><p style="font-size:18px;text-align:right"><strong>Total: Rs. ${Number(order.totalAmount).toFixed(2)}</strong></p><h3>Delivery address</h3><p>${addressText}</p><p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod)} (${escapeHtml(order.paymentStatus)})</p><p>You can track your order from the Track Order page.</p></div>`,
  });
};
