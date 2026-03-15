import { ClientSecretCredential } from '@azure/identity';
import fs from 'node:fs/promises';
import path from 'node:path';
import { graphAuth, graphSender } from '../../graph.private.js';

const credential = new ClientSecretCredential(
  graphAuth.tenantId,
  graphAuth.clientId,
  graphAuth.clientSecret
);

async function getAccessToken() {
  const token = await credential.getToken(
    'https://graph.microsoft.com/.default'
  );
  return token.token;
}

function toRecipients(addresses = []) {
  return addresses.map((address) => ({
    emailAddress: { address },
  }));
}

async function toGraphAttachments(attachments = []) {
  // attachments: [{ filename, path, contentType?, isInline?, contentId? }]
  const out = [];

  for (const att of attachments) {
    const fileBuf = await fs.readFile(att.path);
    const contentBytes = fileBuf.toString('base64');

    const name = att.filename || path.basename(att.path);
    const ext = path.extname(name).toLowerCase();

    // Prefer explicit contentType if caller provided it (e.g., inline logo image)
    const contentType =
      att.contentType ||
      (ext === '.pdf' ? 'application/pdf' : 'application/octet-stream');

    out.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name,
      contentType,
      contentBytes,
      ...(att.isInline
        ? {
            isInline: true,
            contentId: att.contentId || att.contentID || att.cid,
          }
        : {}),
    });
  }

  return out;
}

export async function sendGraphMail({
  to = [],
  cc = [],
  subject,
  html,
  attachments = [],
  saveToSentItems = true,
  sender = graphSender, // optional override
}) {
  const accessToken = await getAccessToken();

  const graphAttachments = await toGraphAttachments(attachments);

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: 'HTML', content: html },
          toRecipients: toRecipients(to),
          ccRecipients: toRecipients(cc),
          attachments: graphAttachments,
        },
        saveToSentItems,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Graph sendMail failed (${res.status}): ${errText}`);
  }

  return { ok: true };
}
