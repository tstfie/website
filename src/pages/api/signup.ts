export const prerender = false;
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    /* ================================
       Honeypot (anti-bot)
    ================================= */
    const honeypot = formData.get("company");
    if (honeypot && String(honeypot).length > 0) {
      // Silently succeed to avoid bot feedback loops
      return new Response(null, { status: 204 });
    }

    /* ================================
       Extract + sanitise fields
    ================================= */
    const email = String(formData.get("email") || "").trim();
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const message = String(formData.get("message") || "").trim();

    /* ================================
       Server-side validation
    ================================= */
    if (!email) {
      return new Response("Email is required", { status: 400 });
    }

    // Minimal email sanity check (do not overdo regex)
    if (!email.includes("@") || email.length > 254) {
      return new Response("Invalid email", { status: 400 });
    }

    if (firstName.length > 100 || lastName.length > 100) {
      return new Response("Name too long", { status: 400 });
    }

    if (message.length > 2000) {
      return new Response("Message too long", { status: 400 });
    }

    /* ================================
       Send to Brevo (Contacts API)
    ================================= */

const LIST_MAP: Record<string, number[]> = {
  designs: [8],
  music: [9],
  other: [10],
};

const interests = formData
  .getAll("interest")
  .map(v => String(v))
  .filter(v => v in LIST_MAP);

if (interests.length === 0) {
  return new Response("Select at least one interest", { status: 400 });
}

const listIds = [...new Set(
  interests.flatMap(i => LIST_MAP[i])
)];

    const brevoRes = await fetch(
      "https://api.brevo.com/v3/contacts/doubleOptinConfirmation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": import.meta.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          email,
          attributes: {
            FIRSTNAME: firstName || undefined,
            LASTNAME: lastName || undefined,
            MESSAGE: message || undefined,
            DOI_STATUS: "PENDING",
          },

          includeListIds: listIds,          // lists are added after confirmation
          templateId: 1,                  // DOI template ID
          redirectionUrl: "https://tstfie.ch/signup/success",

        }),
      }
    );

    if (!brevoRes.ok) {
    const text = await brevoRes.text();
    console.error("Brevo status:", brevoRes.status);
    console.error("Brevo body:", text);
      return new Response("Failed to submit form", { status: 500 });
    }

    /* ================================
       Redirect on success
    ================================= */
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/signup/success",
      },
    });
    } catch (err) {
      console.error("Contact API error:", err);

      return new Response(
        err instanceof Error ? err.message : String(err),
        { status: 500 }
      );
    }
}
;