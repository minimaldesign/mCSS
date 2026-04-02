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
| `type`       | `"intro"` \| `"atom"` \| `"component"` | yes      |

Slug = file path without extension. Renaming/moving a content file changes its URL (see also `agents/pitfalls.md`).
