#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { compareTrails, scanFile } from './core.mjs';

function usage() {
  console.error('Usage: focustrail scan <file.html> [--output path] [--format text|json]\n       focustrail compare <baseline.json> <current.json>');
}

function option(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

async function main(args) {
  const command = args[0];
  if (command === 'scan' && args[1]) {
    const report = await scanFile(args[1]);
    const format = option(args, '--format', 'json');
    const output = option(args, '--output');
    const rendered = format === 'text'
      ? [`FocusTrail: ${report.summary.focusableElements} focusable element(s), ${report.summary.findings} finding(s)`,
        ...report.focusOrder.map((item, index) => `${index + 1}. ${item.locator} (tabindex=${item.tabIndex})`),
        ...report.findings.map((finding) => `[${finding.severity.toUpperCase()}] ${finding.ruleId} ${finding.locator}: ${finding.message}`)].join('\n')
      : JSON.stringify(report, null, 2);
    if (output) await writeFile(output, `${rendered}\n`);
    else console.log(rendered);
    return report.findings.some((finding) => finding.severity === 'high') ? 1 : 0;
  }
  if (command === 'compare' && args[1] && args[2]) {
    const baseline = JSON.parse(await readFile(args[1], 'utf8'));
    const current = JSON.parse(await readFile(args[2], 'utf8'));
    const comparison = compareTrails(baseline, current);
    console.log(JSON.stringify(comparison, null, 2));
    return comparison.regressed || comparison.removed.length || comparison.reordered ? 1 : 0;
  }
  usage();
  return 2;
}

process.exitCode = await main(process.argv.slice(2)).catch((error) => {
  console.error(`focustrail: ${error.message}`);
  return 2;
});

