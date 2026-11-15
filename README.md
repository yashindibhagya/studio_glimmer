# Studio Glimmer — website + admin portal

Custom rhinestone creations shop. Customers browse, add pieces to an **order bag**, and send the whole order to you on **WhatsApp** in one tap. You manage everything from the **admin portal** at `/admin`.

## Run it on your computer

```bash
npm install
npm run dev        # http://localhost:3000   ·   admin: http://localhost:3000/admin
```

Without Firebase/Cloudinary keys the site runs in **local mode**: data is saved in `.data/` on this computer. The two are independent: with only the Cloudinary keys set, photos go to Cloudinary while the data stays local. The admin login is in `.env.local` (email `admin@studioglimmer.lk`, password on the `# Dev password` line).

## What's in the admin portal

| Page | What you can do |
|---|---|
| Dashboard | New request count, plus a "Before you launch" checklist |
| Products | Add/edit/delete, photos (auto-resized), price & sale price, options (colour, size, phone model), personalisation box, Featured / New / Hidden / Made-to-order, reorder |
| Categories | Add/rename/reorder, cover photo |
| Custom Requests | Ideas from the Custom Order form, reference photos, one-tap WhatsApp reply, status + private notes |
| Gallery | Upload photos of finished work, captions, reorder |
| Reviews | Customer testimonials with star ratings |
| FAQs | Questions shown on the homepage and FAQ page |
| Site Settings | WhatsApp number, social links, announcement bar, homepage text & photo, About story, policy pages |

Every save updates the live website immediately.

## Going live (Firebase + Cloudinary + Vercel — all free, no card needed)

1. **Firebase** (data) → [console.firebase.google.com](https://console.firebase.google.com) → *Add project* (Spark/free plan is fine).
   - *Build → Firestore Database → Create database* → choose a location (e.g. `asia-south1`) → *production mode*.
   - *Firestore → Rules*: paste `firestore.rules` from this project → *Publish*.
   - *Project settings → Service accounts → Generate new private key*. This downloads a JSON file; keep it secret. From it you need `project_id`, `client_email` and `private_key`.
2. **Cloudinary** (photos) → sign up at [cloudinary.com](https://cloudinary.com) (free plan) → *Dashboard*: copy **Cloud name**, **API Key** and **API Secret**.
3. **Choose your real admin password** and hash it:
   ```bash
   npm run hash-password -- "your-strong-password"
   ```
4. **Vercel** → import this project → add these Environment Variables:
   | Name | Value |
   |---|---|
   | `FIREBASE_PROJECT_ID` | `project_id` from the JSON |
   | `FIREBASE_CLIENT_EMAIL` | `client_email` from the JSON |
   | `FIREBASE_PRIVATE_KEY` | `private_key` from the JSON, pasted exactly, including `-----BEGIN…` and the `\n`s |
   | `CLOUDINARY_CLOUD_NAME` | Cloud name |
   | `CLOUDINARY_API_KEY` | API Key |
   | `CLOUDINARY_API_SECRET` | API Secret |
   | `ADMIN_EMAIL` | your email |
   | `ADMIN_PASSWORD_HASH` | hash from step 3 (paste as-is in Vercel) |
   | `SESSION_SECRET` | output of `openssl rand -hex 32` |
   | `NEXT_PUBLIC_SITE_URL` | `https://studioglimmer.lk` (or your Vercel URL) |
5. Deploy, connect your domain in Vercel → *Domains*, then open `/admin` and work through the **Before you launch** checklist. Starter content is created in Firestore automatically on the first visit.

The build fails on purpose if Firebase/Cloudinary aren't configured on Vercel, so a site that can't save data can never go live by accident.

## Tech notes

- Next.js 16 (App Router, Cache Components): public pages are cached and refreshed instantly through `updateTag` whenever the admin saves.
- Data lives in Firestore, one collection per type (`products`, `categories`, `requests`, …). Only the server reads or writes it, through a service account; `firestore.rules` blocks all browser access. Photos go to Cloudinary under `studio-glimmer/…` using signed uploads, and the API secret never leaves the server.
- Admin auth: one admin, bcrypt password hash in env, signed httpOnly session cookie (7 days), login lockout after 5 failed attempts. `src/proxy.ts` guards `/admin`, and every server action re-checks the session.
- Uploads are resized to WebP in the browser, then the server checks the file signature (JPG/PNG/WebP only, max 3 MB).
