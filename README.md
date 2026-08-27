# FocusTrail CI

FocusTrail extracts keyboard focus order from static HTML, reports risky focus patterns, and compares a current focus trail with a committed baseline. It runs locally, as a CLI, or as a composite GitHub Action.

## Run

```bash
npm install
node src/cli.mjs scan examples/form.html --format text
node src/cli.mjs scan examples/form.html --output focus.json
node src/cli.mjs compare baseline.json focus.json
```

## Rules

- `FT001`: positive `tabindex` overrides natural order
- `FT002`: a focusable control is hidden from the accessibility tree
- `FT003`: `role="button"` is not keyboard focusable
- `FT004`: duplicate IDs make focus targeting ambiguous
- `FT005`: autofocus can move focus without user intent

The static parser is intentionally fast and deterministic. It cannot observe controls created at runtime, shadow DOM, CSS visibility, focus traps, or actual browser behavior. Use it as an early CI guardrail and pair it with browser-based accessibility testing for production interfaces.

## GitHub Action

```yaml
- uses: Kwondh0321/focustrail-ci@main
  with:
    html: dist/index.html
    baseline: accessibility/focus-baseline.json
```

## Development

```bash
npm test
npm run smoke
```

## License

MIT
