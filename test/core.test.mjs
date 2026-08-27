import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeHtml, compareTrails } from '../src/core.mjs';

test('extracts focus order and flags positive tabindex', () => {
  const report = analyzeHtml('<a id="home" href="/">Home</a><button id="save" tabindex="2">Save</button><input name="q">');
  assert.deepEqual(report.focusOrder.map((item) => item.locator), ['#save', '#home', 'input[name="q"]']);
  assert.equal(report.findings[0].ruleId, 'FT001');
});

test('flags aria-hidden focus and non-focusable role button', () => {
  const report = analyzeHtml('<button id="hidden" aria-hidden="true">X</button><div id="fake" role="button">Go</div>');
  assert.deepEqual(new Set(report.findings.map((finding) => finding.ruleId)), new Set(['FT002', 'FT003']));
});

test('compares removed and reordered controls', () => {
  const baseline = analyzeHtml('<button id="a">A</button><button id="b">B</button>');
  const current = analyzeHtml('<button id="b">B</button><button id="c">C</button>');
  const diff = compareTrails(baseline, current);
  assert.deepEqual(diff.removed, ['#a']);
  assert.deepEqual(diff.added, ['#c']);
  assert.equal(diff.reordered, false);
});

