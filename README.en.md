# FocusTrail CI

[한국어](README.md) | English | [Changelog / 변경 기록](CHANGELOG.md)

FocusTrail CI extracts keyboard focus order from static HTML, reports risky patterns, and compares the current result with a reviewed baseline. It is available as a Node.js CLI and a GitHub composite action.

## Install and run

```bash
git clone https://github.com/Kwondh0321/focustrail-ci.git
cd focustrail-ci
npm ci
node src/cli.mjs scan examples/form.html --format text
node src/cli.mjs scan examples/form.html --output focus.json
node src/cli.mjs compare baseline.json focus.json
```

```yaml
- uses: Kwondh0321/focustrail-ci@v0.1.0
  with:
    html: dist/index.html
    baseline: accessibility/focus-baseline.json
```

## Rules

- `FT001`: positive `tabindex` changes natural focus order
- `FT002`: a focusable element is hidden from the accessibility tree
- `FT003`: `role="button"` is not keyboard-focusable
- `FT004`: duplicate IDs make focus targets ambiguous
- `FT005`: `autofocus` can move focus unexpectedly
- `FT006`: `tabindex` is not a valid integer

Static analysis cannot observe runtime DOM changes, CSS visibility, Shadow DOM, or actual focus traps. Pair it with browser-based accessibility tests.

## Development

```bash
npm run check
npm test
npm run smoke
```

Licensed under MIT.
