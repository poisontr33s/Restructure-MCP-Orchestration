#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, '..', 'docs', 'session-log', 'session.jsonl');

function isIsoDate(s) {
  const d = new Date(s);
  return !isNaN(d) && /\d{4}-\d{2}-\d{2}T/.test(s);
}

function validateEntry(obj) {
  const errs = [];
  if (!obj || typeof obj !== 'object') { errs.push('not an object'); return errs; }
  if (!obj.timestamp || typeof obj.timestamp !== 'string' || !isIsoDate(obj.timestamp)) errs.push('timestamp missing/invalid');
  if (!obj.topic || typeof obj.topic !== 'string' || obj.topic.trim() === '') errs.push('topic missing');
  if (!obj.summary || typeof obj.summary !== 'string' || obj.summary.trim() === '') errs.push('summary missing');
  if (!obj.actor || typeof obj.actor !== 'string' || obj.actor.trim() === '') errs.push('actor missing');
  // details: any
  if (obj.tags && !Array.isArray(obj.tags)) errs.push('tags must be array of strings');
  if (Array.isArray(obj.tags) && obj.tags.some(t => typeof t !== 'string')) errs.push('tags elements must be strings');
  if (obj.level && !['info','warn','error'].includes(obj.level)) errs.push('level must be info|warn|error');
  return errs;
}

const content = fs.readFileSync(file, 'utf8').split(/\r?\n/);
let ok = true;
let count = 0;
const problems = [];
for (let i = 0; i < content.length; i++) {
  const line = content[i].trim();
  if (!line) continue;
  count++;
  try {
    const obj = JSON.parse(line);
    const errs = validateEntry(obj);
    if (errs.length) { ok = false; problems.push({ line: i+1, errors: errs }); }
  } catch (e) {
    ok = false; problems.push({ line: i+1, errors: ['invalid JSON: ' + e.message] });
  }
}

if (ok) {
  console.log(`Session log OK: ${count} entries validated`);
  process.exit(0);
} else {
  console.error('Session log has errors:');
  for (const p of problems) console.error(`  line ${p.line}: ${p.errors.join('; ')}`);
  process.exit(1);
}
