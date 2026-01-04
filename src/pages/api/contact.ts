import type { APIRoute } from 'astro';

const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
const TO_EMAIL = 'info@tstfie.ch';
const FROM_EMAIL = 'no-reply@tstfie.ch'; // must be verified in Brevo

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, lastName, email, message, website } = await request.json();

    // Honeypot check
    if (website) {
      return new Response(JSON.stringify({ error: 'Spam detected' }), { status: 400 });
    }

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const senderName = lastName ? `${name} ${lastName}` : name;

    const payload = {
      sender: { name: 'tstfie', email: FROM_EMAIL },
      to: [{ email: TO_EMAIL, name: 'tstfie' }],
      subject: `Message from ${senderName}`,
      htmlContent: `
        <p><strong>Name:</strong> ${senderName}</p>
        <p><strong>Reply to:</strong> ${email}</p>
        <p>${message}</p>
      `,
      replyTo: { email, name: senderName } // <--- user email goes here
    };

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY!,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: text }), { status: res.status });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
};
