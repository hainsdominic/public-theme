# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shopify theme for **Café Public** (cafepublic.myshopify.com) — a Quebec-based specialty coffee marketplace. Built on the **Combine** theme (v2.4.3) by KrownThemes. French-language store.

## Development Setup

No build tools — assets are pre-built and committed directly. Development uses the Shopify CLI:

```bash
# First-time setup: enable the pre-push hook that pulls from Shopify before pushing
git config core.hooksPath .githooks

# Serve theme locally against the live store
shopify theme dev --store cafepublic.myshopify.com

# Push theme to Shopify (production syncs from GitHub main branch)
git push origin main

# Pull latest theme state from Shopify (captures editor changes)
shopify theme pull --store cafepublic.myshopify.com
```

There are no tests, linters, or build steps.

The **pre-push hook** (`.githooks/pre-push`) automatically runs `shopify theme pull` before every push. If the client made changes in the Shopify editor that aren't committed, the push is blocked until you commit them. This prevents overwriting editor changes.

## Architecture

### Liquid Template Hierarchy
`layout/theme.liquid` → `templates/*.json` → `sections/*.liquid` → `snippets/*.liquid`

- **Templates** (`templates/`) are JSON files that define which sections appear on each page type. These are frequently edited via the Shopify theme editor and may be overwritten by it.
- **Sections** (`sections/`, 70 files) are self-contained Liquid components with their own schema, settings, CSS, and JS.
- **Snippets** (`snippets/`, 45 files) are reusable partials rendered via `{% render %}`.

### JavaScript Pattern
Uses **Web Components** (custom HTML elements) — not a framework. Each component is a standalone ES6 class in `assets/component-*.js` or `assets/section-*.js`. Interactive elements like `<sidebar-drawer>`, `<product-variants>`, `<search-form>` are defined as custom elements.

Global state lives on the `KROWN` object (initialized in `theme.liquid`) with settings, routes, locales, and symbols.

### Key Custom Files
- `assets/collection-filters.js` — Custom AJAX filtering with client-side pagination (recently built, not part of original theme)
- `assets/gymnase-custom.css` — Custom CSS overrides
- `sections/collection-filter-helper.liquid` — Server-side helper section for single-request AJAX filter fetching

### CSS
`assets/theme.css` is the main stylesheet. Component CSS lives in `assets/component-*.css` and `assets/section-*.css`, loaded on demand.

### Config
- `config/settings_schema.json` — Theme setting definitions (typography, colors, layout)
- `config/settings_data.json` — Active theme setting values

## Important Considerations

- **Template JSON files are auto-generated** by the Shopify editor. They have a comment header warning about this. When the client edits the homepage in Shopify's editor, those changes only exist on Shopify until explicitly pulled. A `git push` will overwrite Shopify's version — always `shopify theme pull` first if the client may have made editor changes.
- **Locales** (`locales/`) contain 56+ language files. The store is French — `locales/fr.json` and `locales/fr.schema.json` are the primary locale files.
- Third-party apps integrated: Judge.me Reviews, Subi Subscriptions, ShineTrust.
