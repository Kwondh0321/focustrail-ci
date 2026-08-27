import { readFile } from 'node:fs/promises';

const tagPattern = /<([a-zA-Z][\w:-]*)(\s[^<>]*?)?>/g;
const attrPattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

function parseAttributes(source = '') {
  const attributes = {};
  for (const match of source.matchAll(attrPattern)) {
    const name = match[1].toLowerCase();
    if (name === '/') continue;
    attributes[name] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

function isDisabled(attributes) {
  return 'disabled' in attributes || attributes['aria-disabled'] === 'true';
}

function isFocusable(tag, attributes) {
  if (isDisabled(attributes) || attributes.hidden !== undefined || attributes.type === 'hidden') return false;
  const tabindex = attributes.tabindex === undefined ? null : Number(attributes.tabindex);
  if (Number.isFinite(tabindex)) return tabindex >= 0;
  if (tag === 'a' || tag === 'area') return Boolean(attributes.href);
  if (['button', 'input', 'select', 'textarea', 'summary', 'iframe'].includes(tag)) return true;
  if (tag === 'audio' || tag === 'video') return 'controls' in attributes;
  return attributes.contenteditable !== undefined && attributes.contenteditable !== 'false';
}

function locator(tag, attributes, index) {
  if (attributes.id) return `#${attributes.id}`;
  if (attributes.name) return `${tag}[name="${attributes.name}"]`;
  if (attributes['aria-label']) return `${tag}[aria-label="${attributes['aria-label']}"]`;
  return `${tag}:nth-focusable(${index + 1})`;
}

export function analyzeHtml(html, source = 'document.html') {
  const elements = [];
  const findings = [];
  const ids = new Map();
  let documentIndex = 0;

  for (const match of html.matchAll(tagPattern)) {
    const tag = match[1].toLowerCase();
    const attributes = parseAttributes(match[2]);
    if (attributes.id) {
      if (ids.has(attributes.id)) {
        findings.push({
          ruleId: 'FT004',
          severity: 'high',
          message: `Duplicate id "${attributes.id}" makes focus targeting ambiguous.`,
          locator: `#${attributes.id}`,
        });
      }
      ids.set(attributes.id, true);
    }
    if (!isFocusable(tag, attributes)) {
      if (attributes.role === 'button' && attributes.tabindex === undefined) {
        findings.push({
          ruleId: 'FT003',
          severity: 'medium',
          message: 'An element with role="button" is not keyboard focusable.',
          locator: locator(tag, attributes, documentIndex),
        });
      }
      continue;
    }

    const tabIndex = attributes.tabindex === undefined ? 0 : Number(attributes.tabindex);
    const item = {
      locator: locator(tag, attributes, documentIndex),
      tag,
      tabIndex,
      documentIndex,
      accessibleName: attributes['aria-label'] || attributes.title || attributes.name || attributes.id || null,
    };
    documentIndex += 1;
    elements.push(item);
    if (tabIndex > 0) {
      findings.push({
        ruleId: 'FT001',
        severity: 'high',
        message: `Positive tabindex=${tabIndex} overrides natural document order.`,
        locator: item.locator,
      });
    }
    if (attributes['aria-hidden'] === 'true') {
      findings.push({
        ruleId: 'FT002',
        severity: 'high',
        message: 'A focusable element is hidden from the accessibility tree.',
        locator: item.locator,
      });
    }
    if ('autofocus' in attributes) {
      findings.push({
        ruleId: 'FT005',
        severity: 'medium',
        message: 'Autofocus may move focus without user intent.',
        locator: item.locator,
      });
    }
  }

  const focusOrder = [...elements].sort((a, b) => {
    const aGroup = a.tabIndex > 0 ? 0 : 1;
    const bGroup = b.tabIndex > 0 ? 0 : 1;
    return aGroup - bGroup || a.tabIndex - b.tabIndex || a.documentIndex - b.documentIndex;
  });
  return {
    schemaVersion: 1,
    source,
    focusOrder,
    findings,
    summary: { focusableElements: focusOrder.length, findings: findings.length },
  };
}

export async function scanFile(path) {
  return analyzeHtml(await readFile(path, 'utf8'), path);
}

export function compareTrails(baseline, current) {
  const before = baseline.focusOrder.map((item) => item.locator);
  const after = current.focusOrder.map((item) => item.locator);
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  const sharedBefore = before.filter((item) => afterSet.has(item));
  const sharedAfter = after.filter((item) => beforeSet.has(item));
  return {
    added: after.filter((item) => !beforeSet.has(item)),
    removed: before.filter((item) => !afterSet.has(item)),
    reordered: JSON.stringify(sharedBefore) !== JSON.stringify(sharedAfter),
    baselineFindings: baseline.findings.length,
    currentFindings: current.findings.length,
    regressed: current.findings.length > baseline.findings.length,
  };
}

