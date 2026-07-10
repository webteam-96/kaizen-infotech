@echo off
REM ---------------------------------------------------------------------------
REM Manual / Windows-Service run of the Next.js standalone server (no IIS module
REM needed). Use this if you prefer running Node as a service (NSSM / pm2 /
REM Task Scheduler) with IIS ARR reverse-proxying to http://localhost:3000,
REM or just to smoke-test the bundle before wiring IIS.
REM
REM Set the contact-form env vars here if you use them (see README-DEPLOY.txt).
REM ---------------------------------------------------------------------------
setlocal
set NODE_ENV=production
set PORT=3000
set HOSTNAME=0.0.0.0
REM set RESEND_API_KEY=...
REM set CONTACT_TO=connect@kaizeninfotech.com
REM set CONTACT_FROM=...
REM set CAPTCHA_SECRET=...

echo Starting Kaizen Infotech site on http://localhost:%PORT%
node server.js
