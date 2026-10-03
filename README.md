# ASIBITIN HAKORI — Find Dental Clinics in Nigeria

A bilingual (English / Hausa) dental clinic directory. Visitors can search and filter clinics, view profiles, call or WhatsApp a clinic, get directions, request appointments, and register a new clinic. A passcode-gated admin view (`#admin`) lets an administrator approve, edit, or remove clinics and manage appointment requests.

## Technology

- A single static `public/index.html` with inline CSS and vanilla JavaScript — no build step.
- Data (clinics, appointments, registrations, language preference) is stored in the browser's `localStorage`.
- Hosted on Netlify (`netlify.toml` publishes the `public/` folder).

## Running locally

```bash
netlify dev --port 8889
# or simply open public/index.html in a browser
```

## Roadmap

The site is currently a front-end prototype. Moving to production would involve:

1. Storing clinics, registrations, and appointments in Netlify Database instead of `localStorage`, so data is shared between visitors.
2. Replacing the client-side admin passcode with real server-side authentication (Netlify Identity) and role-based access for admins and clinic owners.
3. Serving clinic images through the Netlify Image CDN and notifying clinics/admin of new appointment requests.
