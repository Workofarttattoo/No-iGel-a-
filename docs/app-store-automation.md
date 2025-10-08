# App Store Automation Playbook

This playbook explains how to use the Fastlane tooling under `mobile/fastlane` to package and ship the Legion (Base44) app to Apple’s App Store. It assumes you already completed the local configuration described in `README.md`.

---

## 1. Prerequisites
- **Apple Developer Program** membership with access to App Store Connect.
- Xcode, command line tools, and CocoaPods installed.
- Logged-in Xcode session (`xcode-select --switch` to the correct path).
- Environment variables (or `.env`/CI secrets) set for:
  - `FASTLANE_USER` / `APPLE_ID`
  - `FASTLANE_PASSWORD` or App-Specific Password
  - `APP_STORE_CONNECT_API_KEY_PATH` (if using API keys)
  - Optional: `MATCH_GIT_URL`, `MATCH_PASSWORD` if you use cert syncing.

Update `mobile/fastlane/Appfile` with your `apple_id`, `team_id`, and bundle identifier if they differ.

---

## 2. Metadata Pipeline
The folder `mobile/fastlane/metadata/en-US/` contains the description, keywords, URLs, and release notes. Edit these before each submission.

To push metadata without uploading a binary:
```bash
cd mobile
bundle exec fastlane ios sync_metadata
```
Fastlane will read the metadata files and update the App Store Connect record.

---

## 3. Building & Uploading
### 3.1 Prepare the Expo iOS project
The lane automatically calls `npx expo prebuild`. Ensure `app.json` has the correct bundle identifier and version.

### 3.2 Build & Upload
```bash
cd mobile
bundle exec fastlane ios release
```
By default this lane:
1. Runs the Expo prebuild (without installing pods).
2. Invokes `build_app` to archive an App Store build (IPA stored in `mobile/build/ios`).
3. Uploads the binary + metadata via `deliver`.

Optional parameters:
- `skip_build:true` – reuse a pre-built IPA located at `build/ios/Base44.ipa`.
- `submit:true` – automatically submit for review after upload.

Example:
```bash
bundle exec fastlane ios release submit:true
```

### 3.3 Manual Archive (if needed)
If Fastlane cannot locate your workspace/scheme after prebuild, run:
```bash
npx expo prebuild --platform ios
open ios/Base44.xcworkspace
```
Then archive via Xcode (`Product → Archive`), export, and run `bundle exec fastlane deliver` to upload metadata + binary.

---

## 4. Screenshots & Assets
Fastlane can upload screenshots placed under `mobile/fastlane/screenshots/<language>/`. Capture them in the simulator (`Cmd+S`) and drop the PNG files there before running `sync_metadata` or `release`.

App icon (1024×1024) and other marketing resources should be managed through Xcode asset catalogs; ensure they are committed before the build.

---

## 5. Submission Emails & Checklist
Use the email templates in `docs/templates/email/` to notify stakeholders when a build is submitted or when App Review replies.

Pre-flight checklist:
- [ ] Increment `version` / `buildNumber` in `app.json` before each submission.
- [ ] Update release notes in `fastlane/metadata/en-US/release_notes.txt`.
- [ ] Confirm the backend production URL is set in `app.json`.
- [ ] Run `bundle exec fastlane ios sync_metadata`.
- [ ] Run `bundle exec fastlane ios release submit:true` (or upload manually and then `deliver`).
- [ ] Record build number, submission date, and review notes in your tracker.

---

## 6. Future Enhancements
- Add Android automation (`supply`) once the Play Console listing is ready.
- Integrate `match` or App Store Connect API keys for CI/CD pipelines.
- Wire Slack/Email notifications using Fastlane actions (`slack`, `mailgun`).

Keep this playbook in sync with your release cadence to avoid regressions.
