# Studio Glimmer — website + admin portal

Custom rhinestone creations shop. Customers browse, add pieces to an **order bag**, and send the whole order to you on **WhatsApp** in one tap. You manage everything from the **admin portal** at `/admin`.

## Run it on your computer

```bash
npm install
npm run dev        # http://localhost:3000   ·   admin: http://localhost:3000/admin
```

Without the Cloudinary keys the site runs in **local mode**: data and photos are saved in `.data/` on this computer. With the keys set, both photos and shop data are saved on Cloudinary, so your computer and the live site show the same shop. The admin login is in `.env.local` (email `admin@studioglimmer.lk`, password on the `# Dev password` line).

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

## Going live (Cloudinary + Vercel — both free, no card needed)

1. **Cloudinary** (photos and data) → sign up at [cloudinary.com](https://cloudinary.com) (free plan) → *Dashboard*: copy **Cloud name**, **API Key** and **API Secret**.
2. **Choose your real admin password** and hash it:
   ```bash
   npm run hash-password -- "your-strong-password"
   ```
3. **Vercel** → import this project → add these Environment Variables:
   | Name | Value |
   |---|---|
   | `CLOUDINARY_CLOUD_NAME` | Cloud name |
   | `CLOUDINARY_API_KEY` | API Key |
   | `CLOUDINARY_API_SECRET` | API Secret |
   | `ADMIN_EMAIL` | your email |
   | `ADMIN_PASSWORD_HASH` | hash from step 2 (paste as-is in Vercel) |
   | `SESSION_SECRET` | output of `openssl rand -hex 32` |
   | `NEXT_PUBLIC_SITE_URL` | `https://studioglimmer.lk` (or your Vercel URL) |
4. Deploy, connect your domain in Vercel → *Domains*, then open `/admin` and work through the **Before you launch** checklist. Starter content is created automatically on the first visit if no shop data exists yet.

The build fails on purpose if Cloudinary isn't configured on Vercel, so a site that can't save data can never go live by accident.

## Tech notes

- Next.js 16 (App Router, Cache Components): public pages are cached and refreshed instantly through `updateTag` whenever the admin saves.
- Data lives on Cloudinary as private JSON files, one per type (`studio-glimmer/data/products.json`, `requests.json`, …). They can only be read with the API secret, and only the server reads or writes them. Every save rewrites that type's file, which suits one admin; two saves at the exact same moment from different servers could lose one of them. Photos go to Cloudinary under `studio-glimmer/…` using signed uploads, and the API secret never leaves the server.
- Admin auth: one admin, bcrypt password hash in env, signed httpOnly session cookie (7 days), login lockout after 5 failed attempts. `src/proxy.ts` guards `/admin`, and every server action re-checks the session.
- Uploads are resized to WebP in the browser, then the server checks the file signature (JPG/PNG/WebP only, max 3 MB).
