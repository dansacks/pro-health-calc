// Vitest reporter that explains results in plain English and writes test-report/index.html and results.md.
import fs from 'node:fs';
import path from 'node:path';
import { OPERATIONS, SUPPORTING_OPERATIONS } from '../support/catalog.js';

const MIN_EXAMPLES = 3;
const REPORT_DIR = 'test-report';

const FILE_GROUPS = {
  'app.test.jsx': 'The whole calculator page',
  'inputs.test.jsx': 'Input forms',
  'outputs.test.jsx': 'Results table, break-even panel, and chart',
  'forms.test.jsx': 'Input form rows',
  'tooltip.test.jsx': 'Tooltips',
};

const esc = (value) => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pad = (text, width) => (text.length >= width ? text : text + ' '.repeat(width - text.length));

function collect(testModules) {
  const calculations = new Map();
  const checks = new Map();
  const screens = new Map();

  for (const testModule of testModules) {
    for (const test of testModule.children.allTests()) {
      const state = test.result().state;
      if (state === 'skipped' || state === 'pending') continue;

      const meta = test.meta();
      const edge = test.name.startsWith('EDGE:');
      const row = {
        name: edge ? test.name.slice(5).trim() : test.name,
        edge,
        passed: state === 'passed',
        expected: meta.expected,
        actual: meta.actual,
        error: test.result().errors?.[0]?.message?.split('\n')[0],
      };

      let target;
      let key = meta.operation;
      if (key && (OPERATIONS[key] || SUPPORTING_OPERATIONS[key])) {
        target = calculations;
      } else if (key === 'catalog') {
        key = 'Coverage and reference-data checks';
        target = checks;
      } else {
        key = FILE_GROUPS[path.basename(testModule.relativeModuleId)] ?? testModule.relativeModuleId;
        target = screens;
      }
      if (!target.has(key)) target.set(key, []);
      target.get(key).push(row);
    }
  }
  return { calculations, checks, screens };
}

const counts = (rows) => ({
  total: rows.length,
  passed: rows.filter((r) => r.passed).length,
  edge: rows.filter((r) => r.edge).length,
  normal: rows.filter((r) => !r.edge).length,
});

export default class PlainEnglishReporter {
  onTestRunEnd(testModules) {
    const { calculations, checks, screens } = collect(testModules);
    const everything = [...calculations.values(), ...checks.values(), ...screens.values()].flat();
    const failed = everything.filter((r) => !r.passed);
    const notRun = Object.keys(OPERATIONS).filter((key) => !calculations.has(key));
    const underCovered = Object.keys(OPERATIONS).filter((key) => calculations.has(key) && counts(calculations.get(key)).normal < MIN_EXAMPLES);

    const model = { calculations, checks, screens, everything, failed, underCovered, partial: notRun.length > 0 };
    this.printConsole(model);
    this.writeReports(model);
  }

  printConsole({ calculations, checks, screens, everything, failed, underCovered, partial }) {
    const line = '='.repeat(72);
    const out = [];
    out.push('', line, ' PRO HEALTH CALCULATOR: TEST REPORT', line);
    out.push(failed.length === 0
      ? ` RESULT: ALL ${everything.length} CHECKS PASSED`
      : ` RESULT: ${failed.length} OF ${everything.length} CHECKS FAILED`);
    out.push(' Each check is one worked example: inputs, the expected answer worked out by');
    out.push(' hand, and what the calculator actually produces.', '');

    const section = (heading, entries) => {
      out.push(` ${heading}`);
      for (const [title, rows] of entries) {
        const c = counts(rows);
        const edges = c.edge ? ` (${c.edge} edge)` : '';
        out.push(`   ${c.passed === c.total ? 'PASS' : 'FAIL'}  ${pad(title, 50)} ${pad(`${c.passed}/${c.total}`, 5)} checks${edges}`);
      }
      out.push('');
    };

    section(`CALCULATIONS (${Object.keys(OPERATIONS).length} results the calculator produces)`,
      Object.entries(OPERATIONS).filter(([key]) => !partial || calculations.has(key)).map(([key, op]) => [op.title, calculations.get(key) ?? []]));
    section('SUPPORTING CALCULATIONS (chart and input forms)',
      Object.entries(SUPPORTING_OPERATIONS).filter(([key]) => !partial || calculations.has(key)).map(([key, op]) => [op.title, calculations.get(key) ?? []]));
    section('COVERAGE AND REFERENCE DATA', [...checks.entries()]);
    section('SCREENS AND FORMS', [...screens.entries()]);

    if (partial) {
      out.push(' PARTIAL RUN: only some tests were run, so coverage was not evaluated.', '');
    } else if (underCovered.length) {
      out.push(` COVERAGE WARNING: fewer than ${MIN_EXAMPLES} normal examples for: ${underCovered.join(', ')}`, '');
    } else {
      out.push(` COVERAGE: every calculation has at least ${MIN_EXAMPLES} normal worked examples.`, '');
    }

    if (failed.length) {
      out.push(' FAILURES');
      for (const row of failed) {
        out.push(`   - ${row.name}`);
        if (row.expected !== undefined) out.push(`       expected: ${row.expected}   actual: ${row.actual}`);
        else if (row.error) out.push(`       ${row.error}`);
      }
      out.push('');
    }

    out.push(` Full report with every example: ${path.join(REPORT_DIR, 'index.html')}`, line, '');
    console.log(out.join('\n'));
  }

  writeReports(model) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    fs.writeFileSync(path.join(REPORT_DIR, 'index.html'), renderHtml(model));
    fs.writeFileSync(path.join(REPORT_DIR, 'results.md'), renderMarkdown(model));
  }
}

const describeGroup = (key) => OPERATIONS[key] ?? SUPPORTING_OPERATIONS[key];

function renderMarkdown({ calculations, checks, screens, everything, failed, underCovered, partial }) {
  const md = [];
  md.push('# Pro Health Calculator: Test Report', '');
  md.push(`Generated: ${new Date().toISOString()}`, '');
  md.push(`**Result: ${failed.length === 0 ? `all ${everything.length} checks passed` : `${failed.length} of ${everything.length} checks failed`}**`, '');
  md.push('Each check is one worked example: the inputs are described, the expected answer was worked out by hand, and the result is compared with what the calculator produces.', '');
  md.push('## Summary', '', '| Calculation | Checks | Passed | Edge cases |', '| --- | ---: | ---: | ---: |');
  for (const [key, op] of Object.entries({ ...OPERATIONS, ...SUPPORTING_OPERATIONS })) {
    const c = counts(calculations.get(key) ?? []);
    md.push(`| ${op.title} | ${c.total} | ${c.passed} | ${c.edge} |`);
  }
  md.push('');
  if (partial) md.push('Partial run: only some tests were run, so this report is incomplete.', '');
  else if (underCovered.length) md.push(`Coverage warning: fewer than ${MIN_EXAMPLES} normal examples for ${underCovered.join(', ')}.`, '');

  for (const [key, op] of Object.entries({ ...OPERATIONS, ...SUPPORTING_OPERATIONS })) {
    md.push(`## ${op.title}`, '', `How it is calculated: ${op.formula}`, '', `Unit: ${op.unit}`, '');
    md.push('| Example | Type | Expected | Actual | Result |', '| --- | --- | ---: | ---: | --- |');
    for (const r of calculations.get(key) ?? []) {
      md.push(`| ${r.name.replace(/\|/g, '\\|')} | ${r.edge ? 'edge case' : 'normal'} | ${r.expected ?? ''} | ${r.actual ?? ''} | ${r.passed ? 'PASS' : 'FAIL'} |`);
    }
    md.push('');
  }

  for (const [heading, map] of [['Coverage and reference data', checks], ['Screens and forms', screens]]) {
    md.push(`## ${heading}`, '', '| Check | Result |', '| --- | --- |');
    for (const [title, rows] of map) {
      for (const r of rows) md.push(`| ${title}: ${r.name.replace(/\|/g, '\\|')} | ${r.passed ? 'PASS' : 'FAIL'} |`);
    }
    md.push('');
  }
  return md.join('\n');
}

function renderHtml({ calculations, checks, screens, everything, failed, underCovered, partial }) {
  const all = { ...OPERATIONS, ...SUPPORTING_OPERATIONS };
  const badge = (ok) => `<span class="${ok ? 'pass' : 'fail'}">${ok ? 'PASS' : 'FAIL'}</span>`;

  const summaryRows = Object.entries(all).map(([key, op]) => {
    const c = counts(calculations.get(key) ?? []);
    return `<tr><td><a href="#${key}">${esc(op.title)}</a></td><td>${esc(op.unit)}</td><td class="num">${c.total}</td><td class="num">${c.edge}</td><td>${badge(c.passed === c.total)}</td></tr>`;
  }).join('\n');

  const sections = Object.entries(all).map(([key, op]) => {
    const rows = (calculations.get(key) ?? []).map((r) => `<tr class="${r.passed ? '' : 'failrow'}">
      <td>${esc(r.name)}${r.edge ? ' <span class="edge">edge case</span>' : ''}</td>
      <td class="num">${esc(r.expected ?? '')}</td><td class="num">${esc(r.actual ?? '')}</td><td>${badge(r.passed)}</td></tr>`).join('\n');
    return `<section id="${key}"><h2>${esc(op.title)}</h2>
      <p><strong>How it is calculated:</strong> ${esc(op.formula)}<br><strong>Unit:</strong> ${esc(op.unit)}</p>
      <table><thead><tr><th>Worked example</th><th>Expected</th><th>Actual</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  }).join('\n');

  const listSection = (heading, map) => `<section><h2>${esc(heading)}</h2><table><thead><tr><th>Check</th><th>Result</th></tr></thead><tbody>
    ${[...map.entries()].flatMap(([title, rows]) => rows.map((r) => `<tr class="${r.passed ? '' : 'failrow'}"><td>${esc(title)}: ${esc(r.name)}</td><td>${badge(r.passed)}</td></tr>`)).join('\n')}
    </tbody></table></section>`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Pro Health Calculator: Test Report</title>
<style>
  body { font-family: system-ui, sans-serif; color: #121212; margin: 0; background: #fff; }
  header { background: #C5050C; color: #fff; padding: 1.2rem 2rem; }
  main { padding: 1rem 2rem 3rem; max-width: 1100px; margin: auto; }
  h2 { border-bottom: 3px solid #C5050C; padding-bottom: .2rem; margin-top: 2.5rem; }
  table { border-collapse: collapse; width: 100%; margin: .8rem 0; }
  th { background: #121212; color: #fff; text-align: left; }
  th, td { padding: .4rem .6rem; border-bottom: 1px solid #E1E5E7; vertical-align: top; }
  tr:nth-child(even) td { background: #f6f7f8; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .pass { color: #1b5e20; font-weight: 700; }
  .fail { color: #9B0000; font-weight: 700; }
  .failrow td { background: #fbe9e9 !important; }
  .edge { background: #E1E5E7; border-radius: 3px; padding: 0 .35rem; font-size: .8em; }
  .status { font-size: 1.3rem; font-weight: 700; }
  a { color: #9B0000; }
</style></head><body>
<header><h1>Pro Health Calculator: Test Report</h1><div>Generated ${esc(new Date().toISOString())}</div></header>
<main>
<p class="status">${failed.length === 0 ? `${badge(true)} All ${everything.length} checks passed` : `${badge(false)} ${failed.length} of ${everything.length} checks failed`}</p>
<p>Each check is one worked example. The inputs are described in plain words, the expected answer was worked out by hand
(or by an independent calculation), and the result is compared with what the calculator produces. "Edge case" examples
show what the calculator does with unusual inputs such as a 100% margin or an empty panel.</p>
${partial ? '<p class="fail">Partial run: only some tests were run, so this report is incomplete.</p>' : underCovered.length ? `<p class="fail">Coverage warning: fewer than ${MIN_EXAMPLES} normal examples for ${esc(underCovered.join(', '))}.</p>` : `<p>Coverage: every calculation has at least ${MIN_EXAMPLES} normal worked examples.</p>`}
<h2>Summary</h2>
<table><thead><tr><th>Calculation</th><th>Unit</th><th>Examples</th><th>Edge cases</th><th>Result</th></tr></thead><tbody>
${summaryRows}
</tbody></table>
${sections}
${listSection('Coverage and reference data', checks)}
${listSection('Screens and forms', screens)}
</main></body></html>`;
}
