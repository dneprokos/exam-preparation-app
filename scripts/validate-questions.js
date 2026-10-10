#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');

let passed = 0;
let failed = 0;

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

// Throws on failure; callers record a failed check instead of aborting.
function readJson(certDir, file) {
  return JSON.parse(readFileSync(join(certDir, file), 'utf8'));
}

function discoverCertifications() {
  return readdirSync(dataDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(dataDir, d.name, 'index.json')))
    .map(d => d.name)
    .sort();
}

function validateCert(certId) {
  const certDir = join(dataDir, certId);
  console.log(`\n=== Certification: ${certId} ===\n`);

  let index;
  try {
    index = readJson(certDir, 'index.json');
  } catch (e) {
    check('index.json is readable', false, e.message);
    return;
  }
  check('index.json has chapters array', Array.isArray(index.chapters));
  check('index.json has exam config', typeof index.exam === 'object');
  if (!Array.isArray(index.chapters)) return;

  const allIds = new Set();
  let globalDuplicates = [];

  for (const chapter of index.chapters) {
    const file = `chapter-${chapter.id}.json`;
    console.log(`\n[Chapter ${chapter.id}: ${chapter.title}]`);

    let questions;
    try {
      questions = readJson(certDir, file);
    } catch (e) {
      check(`${file} is readable`, false, e.message);
      continue;
    }

    check(`${file} is an array`, Array.isArray(questions));
    if (!Array.isArray(questions)) continue;
    check(
      `has at least ${chapter.examQuestions} questions (min required)`,
      questions.length >= chapter.examQuestions,
      `found ${questions.length}`
    );

    const pointValues = [...new Set(questions.map(q => q.points))];
    if (chapter.mixedPoints) {
      check('mixedPoints chapter declares more than one point value', pointValues.length > 1, `found ${pointValues.join(', ')}`);
    } else {
      check(
        'all questions have same point value (random selection guarantee)',
        pointValues.length === 1,
        pointValues.length > 1 ? `multiple point values: ${pointValues.join(', ')}` : ''
      );
    }

    for (const q of questions) {
      const optionIds = new Set(q.options.map(o => o.id));

      if (allIds.has(q.id)) {
        globalDuplicates.push(q.id);
      }
      allIds.add(q.id);

      const correctExistInOptions = q.correct.every(c => optionIds.has(c));
      check(
        `${q.id}: correct options exist in options array`,
        correctExistInOptions,
        !correctExistInOptions ? `missing: ${q.correct.filter(c => !optionIds.has(c)).join(', ')}` : ''
      );

      if (q.type === 'single') {
        check(`${q.id}: single type has exactly 1 correct`, q.correct.length === 1, `found ${q.correct.length}`);
      } else if (q.type === 'multiple') {
        check(`${q.id}: multiple type has ≥2 correct`, q.correct.length >= 2, `found ${q.correct.length}`);
      } else {
        check(`${q.id}: type is 'single' or 'multiple'`, false, `found '${q.type}'`);
      }
    }
  }

  console.log('\n[Global Checks]');
  check('no duplicate question IDs across all chapters', globalDuplicates.length === 0, globalDuplicates.join(', '));
}

console.log('\n=== Question Bank Validation ===');

const requested = process.argv[2];
const certIds = discoverCertifications();

if (requested) {
  if (!certIds.includes(requested)) {
    console.error(`\nCertification '${requested}' not found in ${dataDir} (available: ${certIds.join(', ') || 'none'})\n`);
    process.exit(1);
  }
  validateCert(requested);
} else {
  if (certIds.length === 0) {
    console.error(`\nNo certification folders (with index.json) found in ${dataDir}\n`);
    process.exit(1);
  }
  for (const id of certIds) validateCert(id);
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
