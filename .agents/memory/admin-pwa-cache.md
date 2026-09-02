---
name: Admin CRM PWA cache behavior
description: Prevent installed AuraEye PWAs from retaining an outdated admin shell.
---

Admin CRM navigation and its login redirect must bypass service-worker caches, and service-worker changes must use a new script/cache version.

**Why:** Installed PWAs on phones and Safari can retain a previously deployed app shell even when the server and API are healthy, making admin fixes appear ineffective across devices.

**How to apply:** When changing the admin entry flow or CRM shell, update the service-worker version and publish the build; verify the live worker and asset hash afterward.