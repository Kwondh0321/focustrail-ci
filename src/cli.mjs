#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { compareTrails, scanFile } from './core.mjs';

const packageMetadata = createRequire(import.meta.url)('../package.json');

function usage() {
  console.error('사용법: focustrail scan <file.html> [--output 경로] [--format text|json]\n        focustrail compare <baseline.json> <current.json>\n        focustrail --version');
}

function option(args, name, fallback = null) {
  const index = args.indexOf(name);
  if (index < 0) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} 옵션에 값이 필요합니다.`);
  return value;
}

async function main(args) {
  if (args[0] === '--version' || args[0] === '-v') {
    console.log(`focustrail ${packageMetadata.version}`);
    return 0;
  }
  const command = args[0];
  if (command === 'scan' && args[1]) {
    const report = await scanFile(args[1]);
    const format = option(args, '--format', 'json');
    if (!['text', 'json'].includes(format)) throw new Error(`지원하지 않는 --format 값입니다: ${format}`);
    const output = option(args, '--output');
    const rendered = format === 'text'
      ? [`FocusTrail: 포커스 요소 ${report.summary.focusableElements}개, 발견 항목 ${report.summary.findings}개`,
        ...report.focusOrder.map((item, index) => `${index + 1}. ${item.locator} (tabindex=${item.tabIndex})`),
        ...report.findings.map((finding) => `[${finding.severity.toUpperCase()}] ${finding.ruleId} ${finding.locator}: ${finding.message}`)].join('\n')
      : JSON.stringify(report, null, 2);
    if (output) {
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, `${rendered}\n`);
    }
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
    console.error(`focustrail 오류: ${error.message}`);
  return 2;
});
