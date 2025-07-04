---
title: "The easiest way to test your local dev site on your phone"
description: "How to test your local Astro dev site on your phone using VS Code Ports or Astro Tunnel for fast testing and client reviews."
pubDate: 2025-07-04
author: "Yann"
tags: ["dev", "astro", "VS Code", "mobile", "tunnel"]
---

**TL;DR:** Want to see your Astro site on your phone before deploying? Use VS Code Ports for secure, private testing, or Astro Tunnel for instant, public sharing—no logins, no hassle.

Devtools are great, but testing your Astro site on a real phone is the only way to make sure it's ready for prime time. Here are two super-fast ways to get your local dev server onto your phone.

## 1. VS Code Ports: Secure, Flexible, Built-In

[VS Code’s Ports](https://code.visualstudio.com/docs/debugtest/port-forwarding) feature lets you share your local server with a public URL. Great for private testing or team reviews.

1. **Start your dev server:**

   ```bash
   npm run dev
   ```

   This usually starts your site at `http://localhost:4321`.

2. **Open the Ports tab** in VS Code (bottom panel or via Command Palette).
3. **Forward your port** (usually 4321), sign in if prompted, and grab your public URL.
4. **Test on your phone:** Open the link or scan the QR code in VS Code.

**Pro tip:** Tunnels are private by default. You can make it public to client review but they'll see a windows "warning" page first which is not the best UX.

## 2. Astro Tunnel: Instant, Public, No Logins

[Astro Tunnel](https://github.com/morinokami/astro-tunnel) uses Cloudflare to give you a public link in seconds. Perfect for client demos or quick mobile checks.

1. **Add Astro Tunnel:**

   ```bash
   npx astro add Astro Tunnel
   ```

2. **Run your dev server:**

   ```bash
   npm run dev
   ```

3. **Click the Tunnel icon** in the Astro Dev Toolbar to get your public URL.
4. **Open on your phone:** Paste the link in your browser—done!

## Verdict

- **VS Code Ports:** Best for private, secure testing. QR codes make phone access easy.
- **Astro Tunnel:** Fastest way to share with anyone, anywhere. Seamless Astro integration.

Try both and see which fits your workflow! Either way, you’ll be previewing your Astro site on your phone in no time. 🚀
