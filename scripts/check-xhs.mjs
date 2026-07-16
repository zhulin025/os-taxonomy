#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const files = [
  'index.html',
  'styles.css',
  'app.js',
  'assets/xhs-icon.png',
  'data/dependencies.js',
  'data/topics.en.js',
  'data/topics.zh-CN.js'
];
const errors = [];
for (const file of files) {
  if (!existsSync(resolve(root, file))) errors.push(`missing ${file}`);
}

const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const js = readFileSync(resolve(root, 'app.js'), 'utf8');
const combined = html + '\n' + js;
const forbidden = [
  ['inline script', /<script(?![^>]*\bsrc=)[^>]*>/i],
  ['inline event handler', /\son[a-z]+\s*=/i],
  ['network request', /\b(fetch|XMLHttpRequest|WebSocket|EventSource|RTCPeerConnection)\s*\(/],
  ['dynamic code', /\beval\s*\(|new\s+Function\s*\(/],
  ['workers or wasm', /\b(WebAssembly|Worker|SharedWorker|ServiceWorker|SharedArrayBuffer)\b/],
  ['embedded page', /<(iframe|object)\b/i],
  ['external navigation', /\bwindow\.open\s*\(|\bwindow\.prompt\s*\(|target\s*=\s*["']_blank|\blocation\.(href\s*=|assign\s*\()/i],
  ['file download', /<a\b[^>]*\bdownload\b/i],
  ['form navigation', /<form\b/i],
  ['external resource', /<(script|link|img|video|audio)\b[^>]*(src|href)\s*=\s*["']https?:\/\//i],
  ['base tag', /<base\b/i],
  ['custom csp', /http-equiv\s*=\s*["']Content-Security-Policy/i]
];
for (const entry of forbidden) {
  if (entry[1].test(combined)) errors.push(entry[0]);
}

const supported = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.woff', '.woff2', '.json']);
for (const file of files) {
  if (!supported.has(extname(file))) errors.push(`unsupported file type ${file}`);
}

if (errors.length) {
  console.error('XHS compatibility check failed:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
const totalBytes = files.reduce((sum, file) => sum + readFileSync(resolve(root, file)).byteLength, 0);
console.log(`XHS compatibility check passed: offline, external scripts only, no blocked APIs (${(totalBytes / 1024 / 1024).toFixed(2)} MiB unpacked).`);
