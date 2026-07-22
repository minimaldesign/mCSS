// Single source of truth for the docs sub-navigation, shared by the docs
// sidebar (NavDocs.astro) and the site header's Docs dropdown/mobile menu
// (SiteHeader.astro). Keep this the only place these pages are listed.

export const docsNavItems = [
  { id: 'start', title: 'Getting Started' },
  { id: 'tokens', title: 'Tokens' },
  { id: 'media-queries', title: 'Media Queries' },
  { id: 'themes', title: 'Themes' },
  { id: 'reset', title: 'Reset' },
  { id: 'elements', title: 'HTML Elements' },
  { id: 'global', title: 'Global Styles' },
  { id: 'helpers', title: 'Helpers' },
  { id: 'ai', title: 'AI Agents' },
  { id: 'template', title: 'Marketing Template' },
];
