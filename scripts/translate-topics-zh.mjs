#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, 'data/topics.json');
const outputPath = resolve(root, 'data/topics.zh-CN.json');
const cachePath = resolve(root, 'data/topics.zh-CN.cache.json');
const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
const cache = new Map();

const TRANSLATED_FIELDS = ['domain', 'name', 'description', 'assessmentPrompt'];
const MAX_BATCH_CHARS = 2600;
const CONCURRENCY = 2;
const SPLITTER = '<<<XHS_SPLIT>>>';
let microsoftToken = '';

function addExistingTranslations(englishDoc, chineseDoc) {
  if (!chineseDoc?.topics || chineseDoc.topics.length !== englishDoc.topics.length) return;
  const chineseById = new Map(chineseDoc.topics.map(topic => [topic.id, topic]));
  for (const topic of englishDoc.topics) {
    const translated = chineseById.get(topic.id);
    if (!translated) continue;
    for (const field of TRANSLATED_FIELDS) {
      if (topic[field] && translated[field]) cache.set(topic[field], translated[field]);
    }
    for (let i = 0; i < (topic.evidence || []).length; i += 1) {
      if (translated.evidence?.[i]) cache.set(topic.evidence[i], translated.evidence[i]);
    }
  }
}

if (existsSync(outputPath)) {
  addExistingTranslations(source, JSON.parse(readFileSync(outputPath, 'utf8')));
}
if (existsSync(cachePath)) {
  const savedCache = JSON.parse(readFileSync(cachePath, 'utf8'));
  for (const [english, chinese] of Object.entries(savedCache)) cache.set(english, chinese);
}

const uniqueTexts = new Set();
for (const topic of source.topics) {
  for (const field of TRANSLATED_FIELDS) {
    if (topic[field]) uniqueTexts.add(topic[field]);
  }
  for (const item of topic.evidence || []) uniqueTexts.add(item);
}
const pending = [...uniqueTexts].filter(text => !cache.has(text));

function makeBatches(texts) {
  const batches = [];
  let current = [];
  let size = 0;
  for (const text of texts) {
    const added = text.length + SPLITTER.length + 2;
    if (current.length && size + added > MAX_BATCH_CHARS) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(text);
    size += added;
  }
  if (current.length) batches.push(current);
  return batches;
}

function sleep(ms) {
  return new Promise(resolvePromise => setTimeout(resolvePromise, ms));
}

async function getMicrosoftToken(forceRefresh = false) {
  if (microsoftToken && !forceRefresh) return microsoftToken;
  const response = await fetch('https://edge.microsoft.com/translate/auth');
  if (!response.ok) throw new Error(`Translation auth HTTP ${response.status}`);
  microsoftToken = await response.text();
  return microsoftToken;
}

async function requestTranslation(text, attempt = 0) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const token = await getMicrosoftToken(attempt > 0);
    const response = await fetch('https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=zh-Hans', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify([{ Text: text }]),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return payload[0].translations[0].text;
  } catch (error) {
    if (attempt >= 7) throw error;
    await sleep(1200 * 2 ** attempt);
    return requestTranslation(text, attempt + 1);
  } finally {
    clearTimeout(timeout);
  }
}

async function translateBatch(batch) {
  if (!batch.length) return;
  if (batch.length === 1) {
    const translated = (await requestTranslation(batch[0])).trim();
    cache.set(batch[0], translated);
    return;
  }
  const joined = batch.join(`\n${SPLITTER}\n`);
  const translated = await requestTranslation(joined);
  const pieces = translated.split(SPLITTER).map(piece => piece.trim());
  if (pieces.length !== batch.length || pieces.some(piece => !piece)) {
    const middle = Math.ceil(batch.length / 2);
    await translateBatch(batch.slice(0, middle));
    await translateBatch(batch.slice(middle));
    return;
  }
  batch.forEach((english, index) => cache.set(english, pieces[index]));
}

function saveCache() {
  writeFileSync(cachePath, JSON.stringify(Object.fromEntries(cache), null, 2) + '\n');
}

const batches = makeBatches(pending);
console.log(`Translation units: ${uniqueTexts.size}; cached: ${cache.size}; pending: ${pending.length}; batches: ${batches.length}`);
let nextBatch = 0;
let completed = 0;

async function worker() {
  while (true) {
    const index = nextBatch;
    nextBatch += 1;
    if (index >= batches.length) return;
    await translateBatch(batches[index]);
    completed += 1;
    saveCache();
    if (completed % 5 === 0 || completed === batches.length) {
      console.log(`Translated ${completed}/${batches.length} batches (${cache.size}/${uniqueTexts.size} units)`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, batches.length || 1) }, worker));

const translatedTopics = source.topics.map(topic => {
  const result = { ...topic };
  for (const field of TRANSLATED_FIELDS) {
    if (topic[field]) result[field] = cache.get(topic[field]);
  }
  result.evidence = (topic.evidence || []).map(item => cache.get(item));
  return result;
});

const output = {
  ...source,
  topics: translatedTopics
};
writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n');
console.log(`Wrote ${outputPath}`);
