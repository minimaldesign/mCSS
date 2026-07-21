# Content Collections

Collections are defined in `src/content.config.ts`. Files whose names start with `_` are excluded.

## Schemas

### Blog (`src/content/blog/`)

| Field         | Type         | Required |
| ------------- | ------------ | -------- |
| `title`       | string       | yes      |
| `pubDate`     | date         | yes      |
| `description` | string       | yes      |
| `author`      | string       | yes      |
| `image`       | `{url, alt}` | no       |
| `tags`        | string[]     | yes      |

#### Blog prose

Do not use the em dash character (`—`) in blog posts. Use commas, a colon, parentheses, or separate sentences instead.

### Docs (`src/content/docs/`)

| Field        | Type   | Required |
| ------------ | ------ | -------- |
| `title`      | string | yes      |
| `lastUpdate` | date   | yes      |
| `version`    | number | yes      |

### Components (`src/content/components/`)

| Field        | Type                                   | Required |
| ------------ | -------------------------------------- | -------- |
| `title`      | string                                 | yes      |
| `lastUpdate` | date                                   | yes      |
| `version`    | number                                 | yes      |
| `type`       | `"intro"` \| `"component"`             | yes      |
| `cssOnly`    | boolean (optional)                     | no       |

`cssOnly: true` marks class-only components with no Astro file (badge, button, toggle); it drives the "(CSS-only)" label in `/llms.txt`.

`version` tracks the maturity of the documented component itself (not the doc): `< 1` = API may still change, `1.0` = stable contract, bump on breaking changes. Keep it honest — a component with open bugs isn't `1.0`.

Component doc filenames are **all lowercase** (`readprogressbar.mdx`, not `ReadProgressBar.mdx`): slugs are path-derived and become public URLs.

Slug = file path without extension. Renaming/moving a content file changes its URL (see also `agents/pitfalls.md`).
