#!/usr/bin/env node
// Mirror images and audio from the repo root into site/public so Astro picks them up.
// Source of truth lives at <repo>/Interactive Tour and <repo>/tour audio.

import { readdirSync, statSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(__dirname, '..');
const ROOT = resolve(SITE, '..');

const tasks = [
  {
    label: 'images',
    src: resolve(ROOT, 'Interactive Tour'),
    dst: resolve(SITE, 'public', 'images'),
    match: /\.(jpe?g|png|webp|svg)$/i,
  },
  {
    label: 'audio',
    src: resolve(ROOT, 'tour audio'),
    dst: resolve(SITE, 'public', 'audio'),
    match: /\.(mp3|wav|m4a|ogg)$/i,
  },
];

let copied = 0;
let skipped = 0;

for (const { label, src, dst, match } of tasks) {
  if (!existsSync(src)) {
    console.warn(`! ${label}: source missing at ${src}`);
    continue;
  }
  if (!existsSync(dst)) mkdirSync(dst, { recursive: true });

  for (const entry of readdirSync(src)) {
    if (!match.test(entry)) continue;
    const srcFile = resolve(src, entry);
    const dstFile = resolve(dst, entry);
    if (!statSync(srcFile).isFile()) continue;
    if (existsSync(dstFile) && statSync(dstFile).mtimeMs >= statSync(srcFile).mtimeMs) {
      skipped++;
      continue;
    }
    copyFileSync(srcFile, dstFile);
    copied++;
  }
  console.log(`  ${label}: synced ${readdirSync(dst).length} files`);
}

console.log(`\nAsset sync done · ${copied} copied · ${skipped} up-to-date`);
