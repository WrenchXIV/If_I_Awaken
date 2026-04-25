#!/usr/bin/env node
// Extract content from the locked design HTMLs into JSON files under src/content/.
// Run once after design HTMLs change.  This preserves the SVG plan verbatim.

import { load } from 'cheerio';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const HTML_DIR = resolve(ROOT, 'Interactive Tour');
const OUT_DIR = resolve(__dirname, '..', 'src', 'data', 'spaces');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const files = [
  { id: 'lobby', file: 'Lobby_Design.html', index: 0 },
  { id: 'space-1', file: 'Space_1_Design.html', index: 1 },
  { id: 'space-2', file: 'Space_2_Design.html', index: 2 },
  { id: 'space-3', file: 'Space_3_Design.html', index: 3 },
  { id: 'space-4', file: 'Space_4_Design.html', index: 4 },
  { id: 'space-5', file: 'Space_5_Design.html', index: 5 },
  { id: 'space-6', file: 'Space_6_Design.html', index: 6 },
  { id: 'space-7', file: 'Space_7_Design.html', index: 7 },
];

const heroImageGuess = {
  lobby: 'Lobby_Design-image1.jpg',
  'space-1': 'Space_1-image1.jpg',
  'space-2': 'Space_2-image2.jpg',
  'space-3': 'Space_3-image1.jpg',
  'space-4': 'Space_4-image1.jpg',
  'space-5': 'Space_5-image1.jpg',
  'space-6': 'Space_6-image1.jpg',
  'space-7': 'Space_7-image1.jpg',
};

const perspectiveImageGuess = {
  lobby: ['Lobby_Design-image2.jpg', 'Lobby_Design-image3.jpg'],
  'space-1': ['Space_1-image2.jpg', 'Space_1-image3.jpg'],
  'space-2': ['Space_2-image3.jpg', 'Space_2-image4.jpg', 'Space_2-image5.jpg', 'Space_2-image6.jpg'],
  'space-3': ['Space_3-image2.jpg', 'Space_3-image3.jpg', 'Space_3-image4.jpg', 'Space_3-image5.jpg'],
  'space-4': ['Space_4-image2.jpg', 'Space_4-image3.jpg', 'Space_4-image4.jpg'],
  'space-5': ['Space_5-image2.jpg', 'Space_5-image3.jpg'],
  'space-6': ['Space_6-image2.jpg', 'Space_6-image3.jpg', 'Space_6-image4.jpg'],
  'space-7': ['Space_7-image2.jpg'],
};

const AUDIO_DIR = resolve(__dirname, '..', 'public', 'audio');
const audioCandidates = {
  lobby: ['Lobby.mp3', 'Lobby.wav', 'Lobby.m4a'],
  'space-1': ['Space1.mp3', 'Space1.wav', 'Space1.m4a'],
  'space-2': ['Space2.mp3', 'Space2.wav', 'Space2.m4a'],
  'space-3': ['Space3.mp3', 'Space3.wav', 'Space3.m4a'],
  'space-4': ['Space4.mp3', 'Space4.wav', 'Space4.m4a'],
  'space-5': ['Space5.mp3', 'Space5.wav', 'Space5.m4a'],
  'space-6': ['Space6.mp3', 'Space6.wav', 'Space6.m4a'],
  'space-7': ['Space7.mp3', 'Space7.wav', 'Space7.m4a'],
};

function resolveAudio(id) {
  for (const candidate of audioCandidates[id] ?? []) {
    if (existsSync(resolve(AUDIO_DIR, candidate))) {
      return `/audio/${candidate}`;
    }
  }
  return null;
}

function cleanHTML(html) {
  return html
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();
}

function inlineHTMLOf($, el) {
  return cleanHTML($(el).html() ?? '');
}

function extractTitle($) {
  const h1 = $('h1').first();
  const clone = h1.clone();
  // Insert spaces around <br> tags so line breaks don't fuse adjacent words.
  clone.find('br').replaceWith(' ');
  const emText = clone.find('em').text().replace(/^[\s—-]+/, '').replace(/\s+/g, ' ').trim();
  clone.find('em').remove();
  const mainText = clone.text().replace(/\s+/g, ' ').replace(/[—-]+\s*$/, '').trim();

  // If main is just "Space N", the em holds the real title.
  if (/^Space\s+\d+$/i.test(mainText) && emText) {
    return { title: emText, tagline: null };
  }
  return { title: mainText || emText, tagline: emText || null };
}

function extractMeta($) {
  const out = [];
  // Pattern A — Lobby: .meta-row > .meta > (.meta-label, .meta-value)
  $('.meta-row .meta').each((_, el) => {
    const label = $(el).find('.meta-label').text().trim();
    const value = $(el).find('.meta-value').text().trim();
    if (label && value) out.push({ label, value });
  });
  // Pattern B — Space 1+: .meta > .meta-item (label first, then <strong>value</strong>)
  if (out.length === 0) {
    $('.meta .meta-item').each((_, el) => {
      const $el = $(el);
      const value = $el.find('strong').text().trim();
      const clone = $el.clone();
      clone.find('strong').remove();
      const label = clone.text().trim();
      if (label && value) out.push({ label, value });
    });
  }
  return out;
}

function extractCallout($) {
  const div = $('.callout').first();
  if (!div.length) return '';
  return cleanHTML(div.html() ?? '');
}

function extractPlan($) {
  // Plan SVG is the first SVG inside .plan-wrap
  const svgEl = $('.plan-wrap svg').first();
  if (!svgEl.length) {
    // Some files put the SVG in a different wrapper; try first SVG that's not inside .perspective-wrap
    const fallback = $('svg').filter((_, el) => $(el).closest('.perspective-wrap').length === 0).first();
    return { svg: $.html(fallback) ?? '', legend: extractLegend($) };
  }
  return { svg: $.html(svgEl), legend: extractLegend($) };
}

function extractLegend($) {
  const out = [];
  $('.legend .legend-row, .plan-legend .legend-row').each((_, row) => {
    const swatch = $(row).find('.legend-swatch');
    const style = swatch.attr('style') || '';
    const colorMatch = style.match(/background[:\-\w]*\s*:\s*([^;]+);?/i);
    const color = colorMatch ? colorMatch[1].trim() : '#999';
    const strong = $(row).find('strong').text().trim();
    const note = $(row).find('span').text().trim();
    if (strong) out.push({ color, label: strong, note: note || undefined });
  });
  return out.length ? out : undefined;
}

const TAG_KINDS = ['light', 'sound', 'move', 'perf', 'wall', 'floor', 'dancers'];

function extractBeats($) {
  const out = [];
  $('.beat').each((_, beat) => {
    const number = $(beat).find('.beat-num').text().trim();
    const title = $(beat).find('.beat-title').text().trim();
    const descEl = $(beat).find('.beat-desc').first();

    const tags = [];

    // Pattern A — Lobby: <span class="tag light">label</span>
    descEl.find('.tag').each((_, t) => {
      const $t = $(t);
      const cls = ($t.attr('class') || '').split(/\s+/);
      const kind = cls.find((c) => TAG_KINDS.includes(c));
      if (!kind) return;
      const label = $t.text().trim();
      tags.push({ kind, label });
    });

    // Pattern B — Space 1+: <span class="light">label</span> (without the "tag" prefix class)
    if (tags.length === 0) {
      descEl.children().each((_, t) => {
        const $t = $(t);
        const cls = ($t.attr('class') || '').trim();
        if (!cls) return;
        if (TAG_KINDS.includes(cls)) {
          tags.push({ kind: cls, label: $t.text().trim() });
        }
      });
    }

    // Strip the matched tags from the description
    const clone = descEl.clone();
    if (tags.length) {
      clone.find('.tag').remove();
      // also remove plain-class spans
      clone.children().each((_, t) => {
        const $t = $(t);
        const cls = ($t.attr('class') || '').trim();
        if (TAG_KINDS.includes(cls)) $t.remove();
      });
    }
    const body = cleanHTML(clone.html() ?? '');
    if (number && title) out.push({ number, title, body, tags });
  });
  return out;
}

function extractDesignState($) {
  let locked = [];
  let stillOpen = [];

  const collectItems = (el) => {
    const items = [];
    $(el).find('ul li').each((_, li) => items.push(cleanHTML($(li).html() ?? '')));
    return items;
  };

  // Pattern A — Lobby: .state-col with h3 heading
  $('.state-col').each((_, col) => {
    const heading = $(col).find('h3').text().trim().toLowerCase();
    const items = collectItems(col);
    if (heading.includes('lock')) locked = items;
    else if (heading.includes('open') || heading.includes('still')) stillOpen = items;
  });

  // Pattern B — Space 1+: .state-card.locked / .state-card.open
  if (!locked.length && !stillOpen.length) {
    $('.state-card').each((_, card) => {
      const cls = ($(card).attr('class') || '').toLowerCase();
      const items = collectItems(card);
      if (cls.includes('locked')) locked = items;
      else if (cls.includes('open')) stillOpen = items;
    });
  }

  // Pattern C — fallback: scan all h3 + ul siblings
  if (!locked.length && !stillOpen.length) {
    $('h3').each((_, h) => {
      const txt = $(h).text().trim().toLowerCase();
      const ul = $(h).next('ul');
      if (!ul.length) return;
      const items = [];
      ul.find('li').each((_, li) => items.push(cleanHTML($(li).html() ?? '')));
      if (txt.includes('lock')) locked = items;
      else if (txt.includes('open') || txt.includes('still')) stillOpen = items;
    });
  }
  return { locked, stillOpen };
}

function extractStatus($) {
  // Footer typically reads "v06 · LOCKED · 04/26"
  const footer = $('.footer').last();
  if (!footer.length) return undefined;
  const txt = footer.text().replace(/\s+/g, ' ').trim();
  const parts = txt.split(/[·•]/).map((s) => s.trim()).filter(Boolean);
  const versionPart = parts.find((p) => /^v\d/i.test(p) || /lock/i.test(p)) ?? parts[parts.length - 1];
  return versionPart || undefined;
}

function extractEyebrow($) {
  return $('.eyebrow').first().text().trim();
}

const slugBase = '/images';

for (const { id, file, index } of files) {
  const path = resolve(HTML_DIR, file);
  if (!existsSync(path)) {
    console.error(`! missing ${file}`);
    continue;
  }
  const html = readFileSync(path, 'utf-8');
  const $ = load(html);

  const { title, tagline } = extractTitle($);
  const subtitleEl = $('.subtitle').first();
  const subtitleText = subtitleEl.length ? cleanHTML(subtitleEl.html() ?? '') : null;

  const meta = extractMeta($);
  const callout = extractCallout($);
  const plan = extractPlan($);
  const beats = extractBeats($);
  const design = extractDesignState($);
  const status = extractStatus($);
  const eyebrow = extractEyebrow($);

  const heroFile = heroImageGuess[id];
  const perspFiles = perspectiveImageGuess[id] ?? [];

  const space = {
    id,
    index,
    eyebrow: eyebrow || `If I Awaken in Los Angeles · ${id}`,
    title: title.replace(/—\s*$/, '').trim(),
    tagline: tagline || null,
    summary: subtitleText || null,
    callout: callout || subtitleText || '',
    hero: {
      src: `${slugBase}/${heroFile}`,
      alt: title,
      position: '50% 55%',
    },
    meta,
    plan: {
      svg: plan.svg,
      caption: undefined,
      legend: plan.legend,
    },
    perspectives: perspFiles.map((f, i) => ({
      src: `${slugBase}/${f}`,
      alt: `${title} — perspective ${i + 1}`,
    })),
    beats,
    design,
    audio: (() => {
      const src = resolveAudio(id);
      return src ? { src, label: `Composer's score · ${id}` } : null;
    })(),
    status: status || 'v01',
  };

  const outPath = resolve(OUT_DIR, `${id}.json`);
  writeFileSync(outPath, JSON.stringify(space, null, 2));
  console.log(`✓ ${id}.json   (${beats.length} beats, ${meta.length} meta, ${design.locked.length}/${design.stillOpen.length} state)`);
}

console.log('\nAll content extracted.');
