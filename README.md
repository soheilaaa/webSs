# Trusse website: editorial design (trusseai.com)

This version follows the "Trusse Website: Design Brief" (9 Nov 2026):
- a serif and sans pairing, with Newsreader and Inter, both free and stored in this folder
- off-white, ink and warm greys, with Trusse red only as the accent
- the page moves from light to dark, ending in the waiting-list form
- the "interface on fine art" panels

All textures are original. They were generated for Trusse from noise, brushwork and engraved truss and facade linework, so there are no licensing issues. The interface pictures are illustrative mock-ups built in HTML, not screenshots.

It's a plain HTML, CSS and JavaScript site with no build step. Use **one** of the two Trusse site folders on trusseai.com, either this one or the earlier glass design.

## What's in this folder

| File or folder | What it is |
|---|---|
| `index.html` | The home page |
| `privacy/index.html` | Privacy notice (trusseai.com/privacy/) |
| `thanks/index.html` | Page shown after joining if a visitor's browser has JavaScript turned off |
| `404.html` | "Page not found" page |
| `assets/` | Styles, script, logos, fonts (hosted here, so visitors' details aren't sent to Google) and the eight textures in `assets/img/tex/` |
| `og-image.png` | The preview image shown when the link is shared on LinkedIn, WhatsApp and similar |
| `favicon.*`, `icon-*.png`, `apple-touch-icon.png` | Browser tab and phone icons |
| `netlify.toml` | Netlify settings: security headers and caching |
| `robots.txt`, `sitemap.xml` | Help search engines find the pages |

There are no analytics or tracking cookies, so the site doesn't need a cookie banner. If you add analytics later, check the cookie rules first.

## Before you go live: fill in the gaps

Search the files for `[` to find each one.

- The footer of every page: `[Ltd]`, `[00000000]`, `[registered office address]`
- `privacy/index.html`:
  - `[DATE]`
  - company details
  - contact email, which appears twice. A privacy notice must tell people how to contact you, so keep a contact route here even though the rest of the site has no email
  - `[list providers]`: at least Netlify, which hosts the site and stores form submissions
  - transfers outside the UK: Netlify, Inc. is based in the US
  - `[12]` months retention

## 1. Put the site online (about 10 minutes)

1. Create a free account at **netlify.com**.
2. Go to **app.netlify.com/drop** and drag this whole folder onto the page. You'll get an address like `something-random.netlify.app`.
3. In the new project, open **Forms** and choose **Enable form detection**.
4. Open **Deploys** and drag the folder in again. Netlify finds the waiting-list form during a deploy, so this second upload is what switches the form on.
5. Test it: open your `.netlify.app` address, join the waiting list with your own details, then check **Forms → waitlist** for your entry.
6. To get an email for each sign-up, go to **Forms → Submission notifications** and add an email notification. The address must belong to a member of your Netlify team, so invite your co-founder first if she should get them too.

You can download every sign-up as a CSV from the **Forms** page.

## 2. Connect trusseai.com (Namecheap)

**In Netlify:**
1. Open **Domain management** and choose **Add a domain**.
2. Enter `trusseai.com`.
3. When Netlify offers to set up DNS, choose to keep your DNS with Namecheap (external DNS).

**In Namecheap:**
1. Go to **Domain List**, then **Manage** next to trusseai.com, then the **Advanced DNS** tab. Nameservers must be set to *Namecheap BasicDNS* on the **Domain** tab.
2. Under **Host records**, delete the parking records: a **CNAME** for `www` pointing to `parkingpage.namecheap.com` and a **URL Redirect** record for `@`. Delete any other **A** or **AAAA** record for `@` too.
3. Choose **Add new record** and add:

   | Type | Host | Value | TTL |
   |---|---|---|---|
   | A Record | `@` | `75.2.60.5` | Automatic |
   | CNAME Record | `www` | your Netlify address, e.g. `something-random.netlify.app` | Automatic |

4. Save with the green tick on each row.

Don't touch any **MX** or **TXT** records you may add later for email.

**Back in Netlify:** changes usually show within an hour, but can take up to 48 hours. When the domain is verified, Netlify sets up the free HTTPS certificate automatically under **Domain management → HTTPS**. Visitors to `www.trusseai.com` are sent to `trusseai.com`.

## 3. Updating the site later

Edit the files, then drag the folder into **Deploys** again. The previous version stays in the deploy list if you ever need to roll back.

## Good to know

- **The waiting-list form** asks for name, work email, company, role and "What is your biggest contract-management problem?" (all required), plus "What do you wish Trusse would solve for you?" (optional). There are also two tick boxes: London Build Expo and updates.
- **Off the live site**, for example in a preview link, the form shows its thank-you message but sends nothing. It only sends on trusseai.com or your `.netlify.app` address.
- **Product names** in "What Trusse Does" (Draft, Review, Ask, Track, Variations) can be changed in `index.html`.
- **After London Build Expo**, delete or replace the black announcement bar at the top of `index.html` (the `<aside class="bar">` block).
