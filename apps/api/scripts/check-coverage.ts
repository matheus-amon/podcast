/**
 * Coverage gate.
 *
 * `coverageThreshold` in bunfig.toml is Jest/Vitest syntax. Bun 1.3.11 has no
 * such option and silently ignores the key, so a 95% threshold sat in config
 * nothing read while the project ran at 82%. This script is the gate that
 * actually bars.
 *
 * Bun writes lcov only (--coverage-reporter supports 'text' and 'lcov'), so this
 * parses lcov.info: FNF/FNH for functions, LF/LH for lines.
 *
 * Usage:
 *   bun test --coverage --coverage-reporter=lcov --coverage-dir=coverage
 *   bun run check-coverage [--lines 80 --functions 75] [--report coverage/lcov.info]
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_REPORT = 'coverage/lcov.info';
const DEFAULT_LINES_THRESHOLD = 80;
const DEFAULT_FUNCTIONS_THRESHOLD = 75;

function parseArgs(argv: string[]) {
  const options: { lines?: number; functions?: number; report?: string } = {};

  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];

    if (flag === '--report') {
      options.report = argv[++i];
    } else if (flag === '--lines') {
      options.lines = Number(argv[++i]);
    } else if (flag === '--functions') {
      options.functions = Number(argv[++i]);
    }
  }

  return options;
}

interface Totals {
  lines: { hit: number; total: number };
  functions: { hit: number; total: number };
}

/** Sums the FNF/FNH and LF/LH records across every file in the lcov report. */
function readLcov(path: string): Totals {
  const totals: Totals = {
    lines: { hit: 0, total: 0 },
    functions: { hit: 0, total: 0 },
  };

  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const [key, value] = line.split(':');
    const count = Number(value);
    if (Number.isNaN(count)) continue;

    if (key === 'LF') totals.lines.total += count;
    else if (key === 'LH') totals.lines.hit += count;
    else if (key === 'FNF') totals.functions.total += count;
    else if (key === 'FNH') totals.functions.hit += count;
  }

  return totals;
}

function percent(hit: number, total: number): number {
  return total === 0 ? 100 : (hit / total) * 100;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const reportPath = resolve(options.report ?? DEFAULT_REPORT);

  if (!existsSync(reportPath)) {
    console.error(`No coverage report at ${reportPath}.`);
    console.error('Run: bun test --coverage --coverage-reporter=lcov --coverage-dir=coverage');
    process.exit(2);
  }

  const { lines, functions } = readLcov(reportPath);
  const linesThreshold = options.lines ?? DEFAULT_LINES_THRESHOLD;
  const functionsThreshold = options.functions ?? DEFAULT_FUNCTIONS_THRESHOLD;

  const linesPct = percent(lines.hit, lines.total);
  const functionsPct = percent(functions.hit, functions.total);

  console.log(
    `lines     ${linesPct.toFixed(2)}%  (${lines.hit}/${lines.total})  threshold ${linesThreshold}%`,
  );
  console.log(
    `functions ${functionsPct.toFixed(2)}%  (${functions.hit}/${functions.total})  threshold ${functionsThreshold}%`,
  );

  const failures: string[] = [];
  if (linesPct < linesThreshold) {
    failures.push(`lines ${linesPct.toFixed(2)}% < ${linesThreshold}%`);
  }
  if (functionsPct < functionsThreshold) {
    failures.push(`functions ${functionsPct.toFixed(2)}% < ${functionsThreshold}%`);
  }

  if (failures.length > 0) {
    console.error(`\nCoverage gate failed: ${failures.join('; ')}`);
    process.exit(1);
  }

  console.log('\nCoverage gate passed.');
}

main();