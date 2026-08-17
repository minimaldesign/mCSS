// Single source of truth for the docs sub-navigation, shared by the docs
// sidebar (NavDocs.astro) and the site header's Docs dropdown/mobile menu
// (SiteHeader.astro). Keep this the only place these pages are listed.
// Entries link to /docs/<id> unless they carry an explicit href.

export const docsNavItems = [
  { id: "start", title: "Getting Started" },
  { id: "installation", title: "Installation" },
  { id: "default-html", title: "Default HTML" },
  { id: "default-theme", title: "Default Theme" },
  { id: "layout", title: "Layout" },
  { id: "components", title: "Components" },
  { id: "helpers", title: "Helpers" },
  { id: "browser-support", title: "Browser Support" },
  { id: "ai", title: "AI Agents" },
];
