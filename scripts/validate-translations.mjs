#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const english = JSON.parse(readFileSync(resolve(root, 'data/topics.json'), 'utf8'));
const chinese = JSON.parse(readFileSync(resolve(root, 'data/topics.zh-CN.json'), 'utf8'));
const errors = [];
const warnings = [];
const fields = ['domain', 'name', 'description', 'assessmentPrompt'];

if (english.topics.length !== chinese.topics.length) {
  errors.push(`topic count mismatch: ${english.topics.length} vs ${chinese.topics.length}`);
}

const chineseById = new Map(chinese.topics.map(topic => [topic.id, topic]));
for (const source of english.topics) {
  const translated = chineseById.get(source.id);
  if (!translated) {
    errors.push(`missing topic ${source.id}`);
    continue;
  }
  for (const key of ['id', 'type', 'subject', 'ageRangeStart', 'ageRangeEnd']) {
    if (translated[key] !== source[key]) errors.push(`${source.id}: structural field changed: ${key}`);
  }
  for (const field of fields) {
    if (!source[field]) continue;
    if (typeof translated[field] !== 'string' || !translated[field].trim()) {
      errors.push(`${source.id}: empty ${field}`);
      continue;
    }
    const wordCount = source[field].trim().split(/\s+/).length;
    if (translated[field] === source[field] && wordCount >= 4) {
      warnings.push(`${source.id}: unchanged ${field}: ${source[field].slice(0, 80)}`);
    }
    const sourcePlaceholders = source[field].match(/\{\{[^}]+\}\}/g) || [];
    const translatedPlaceholders = translated[field].match(/\{\{[^}]+\}\}/g) || [];
    if (sourcePlaceholders.join('|') !== translatedPlaceholders.join('|')) {
      errors.push(`${source.id}: placeholder mismatch in ${field}`);
    }
  }
  if ((source.evidence || []).length !== (translated.evidence || []).length) {
    errors.push(`${source.id}: evidence count mismatch`);
  } else {
    translated.evidence.forEach((item, index) => {
      if (typeof item !== 'string' || !item.trim()) errors.push(`${source.id}: empty evidence ${index}`);
    });
  }
  if (JSON.stringify(source.standards || []) !== JSON.stringify(translated.standards || [])) {
    errors.push(`${source.id}: standards codes changed`);
  }
}

if (warnings.length) {
  console.warn(`Translation warnings (${warnings.length}):`);
  warnings.slice(0, 20).forEach(warning => console.warn(`- ${warning}`));
}
if (errors.length) {
  console.error(`Translation validation failed (${errors.length}):`);
  errors.slice(0, 40).forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Translation validation passed: ${chinese.topics.length} topics, IDs/schema/placeholders/evidence preserved.`);
