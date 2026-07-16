#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const englishSource = JSON.parse(readFileSync(resolve(root, 'data/topics.json'), 'utf8'));
const chineseSource = JSON.parse(readFileSync(resolve(root, 'data/topics.zh-CN.json'), 'utf8'));
const dependenciesSource = JSON.parse(readFileSync(resolve(root, 'data/dependencies.json'), 'utf8'));

if (englishSource.topics.length !== chineseSource.topics.length) {
  throw new Error('English and Chinese topic counts do not match.');
}

const chineseById = new Map(chineseSource.topics.map(topic => [topic.id, topic]));
for (const topic of englishSource.topics) {
  const translated = chineseById.get(topic.id);
  if (!translated) throw new Error(`Missing Chinese topic ${topic.id}`);
  if ((translated.evidence || []).length !== (topic.evidence || []).length) {
    throw new Error(`Evidence count mismatch for ${topic.id}`);
  }
}

function compactTopic(topic) {
  return {
    id: topic.id,
    type: topic.type,
    subject: topic.subject,
    domain: topic.domain,
    name: topic.name,
    description: topic.description,
    ageRangeStart: topic.ageRangeStart,
    ageRangeEnd: topic.ageRangeEnd,
    evidence: topic.evidence,
    assessmentPrompt: topic.assessmentPrompt,
    standards: topic.standards
  };
}

const englishTopics = englishSource.topics.map(compactTopic);
const chineseTopics = englishSource.topics.map(topic => compactTopic(chineseById.get(topic.id)));
const dependencies = dependenciesSource.dependencies.map(edge => ({
  topicId: edge.topicId,
  prerequisiteId: edge.prerequisiteId
}));

writeFileSync(
  resolve(root, 'data/topics.en.js'),
  `globalThis.XHS_TOPIC_DATA=${JSON.stringify(englishTopics)};\n`
);
writeFileSync(
  resolve(root, 'data/topics.zh-CN.js'),
  `globalThis.XHS_TOPIC_DATA=${JSON.stringify(chineseTopics)};\n`
);
writeFileSync(
  resolve(root, 'data/dependencies.js'),
  `globalThis.XHS_DEPENDENCIES=${JSON.stringify(dependencies)};\n`
);

console.log(`Built bilingual offline bundles: ${englishTopics.length} topics × 2 languages, ${dependencies.length} dependencies.`);
