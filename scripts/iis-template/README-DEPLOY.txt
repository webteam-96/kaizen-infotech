================================================================================
 Kaizen Infotech Solutions — IIS / Windows Server deployment bundle
================================================================================

This is a SELF-CONTAINED Next.js production build (output: "standalone").
Everything needed to run the site is in this folder: the server, a trimmed
node_modules, the compiled app (.next), and all static assets (public/).

  server.js            -> the Node server (entry point)
  node_modules/        -> only the packages the server needs (already trimmed)
  .next/               -> compiled app + .next/static assets
  public/              -> images, videos, data/blogs.json, favicons, etc.
  web.config           -> IIS config (HttpPlatformHandler) — see Option A
  start.bat            -> manual / service run on port 3000 — see Option B
  .env.example         -> the environment variables the app understands

--------------------------------------------------------------------------------
 PREREQUISITE (both options)
--------------------------------------------------------------------------------
Install Node.js LTS (v18.18+; v20 or v22 recommended) on the server:
  https://nodejs.org/en/download
Default install path is  C:\Program Files\nodejs\node.exe

--------------------------------------------------------------------------------
 OPTION A — Host inside IIS with HttpPlatformHandler  (recommended)
--------------------------------------------------------------------------------
1. Install the IIS HttpPlatformHandler module (one-time, per server):
   https://www.iis.net/downloads/microsoft/httpplatformhandler
2. Copy this whole folder to the server, e.g.  C:\inetpub\kaizen\
3. In IIS Manager: create (or point) a Site/Application at that folder.
   - Give the App Pool "No Managed Code", and make sure its identity has
     Read/Execute on the folder and Write on the .\logs subfolder.
4. If Node is NOT at C:\Program Files\nodejs\node.exe, edit web.config ->
   httpPlatform processPath to the correct node.exe path.
5. Browse the site. IIS starts "node server.js" on a private port and proxies
   to it. Startup logs go to .\logs\node.log.

--------------------------------------------------------------------------------
 OPTION B — Run Node as a service, IIS reverse-proxies to it
--------------------------------------------------------------------------------
Use this if you don't want the HttpPlatformHandler module.
1. Run the server as a Windows Service (NSSM, pm2-windows-service) or Task
   Scheduler task that runs:  start.bat   (listens on http://localhost:3000)
   - Quick test: double-click start.bat and open http://localhost:3000
2. In IIS, install "Application Request Routing" (ARR) + "URL Rewrite", enable
   proxy, and add a reverse-proxy rule forwarding your site to
   http://localhost:3000/.
   (In this case web.config is not used — delete it or ignore it.)

--------------------------------------------------------------------------------
 ENVIRONMENT VARIABLES (runtime)
--------------------------------------------------------------------------------
The site RUNS with no configuration. These are only needed for optional features:

  Blog store        -> none. Posts are read/written to public/data/blogs.json on
                       disk (this is a persistent server), so the /admin panel and
                       the public /blog pages just work. Leave the KV_* vars unset.

  Admin panel        -> NEXT_PUBLIC_ADMIN_PASSWORD + ADMIN_TOKEN (default password
                       "kaizen-admin-2026"). NOTE: NEXT_PUBLIC_* is baked at BUILD
                       time — to change it you must rebuild, not just set it here.

  Contact form email -> RESEND_API_KEY, CONTACT_TO, CONTACT_FROM
  Contact captcha    -> CAPTCHA_SECRET
                       Set these (Option A: in web.config <environmentVariables>;
                       Option B: in start.bat or the service env). Without them the
                       contact form UI still renders but won't send email.

See .env.example for the full list.

--------------------------------------------------------------------------------
 NOTES
--------------------------------------------------------------------------------
* Node process listens on the PORT env var (IIS sets it automatically in Option A;
  start.bat sets 3000 in Option B).
* public/videos holds the background videos (~61 MB) — keep them; the hero/section
  backgrounds reference them.
* To update the site later: rebuild on a dev machine (npm ci && npm run build),
  re-assemble .next/standalone + .next/static + public, and replace this folder.
================================================================================
