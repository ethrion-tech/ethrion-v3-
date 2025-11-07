# MOBILE RESET & DEPLOY — Quick Guide (Mobile-first)

Goal: One-button reset and deploy with a single ZIP upload.

Steps:
1. Upload `ETHRION_v3.4_MobileReady_Full.zip` to repo root or to `mobile_drop/`.
   - Use GitHub mobile: Add file → Upload files
   - If uploading to root, filename should be exactly `ETHRION_v3.4_MobileReady_Full.zip`
   - Alternatively set path `mobile_drop/ETHRION_v3.4_MobileReady_Full.zip`

2. Run workflow: Actions → "Reset and Deploy from mobile_drop" → Run workflow
   - This will purge all repo files (preserving .github workflows), then unzip and merge the zip contents.

3. Wait for Actions to finish (check logs). Then verify site and Code tab.

Notes:
- The purge step preserves `.github` so workflows keep running.
- The process will overwrite files with the uploaded contents.
- If you prefer an initial dry run, run the "Purge Repository (Complete Reset)" workflow first to clear repo, then upload the zip and run deploy.
