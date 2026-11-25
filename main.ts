import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFESSION, MAX_CHARS } from './confession.ts';

// Write one unsent micro-confession to /output/entry.txt.
// The sealed gate wants UTF-8 text of 1 to 260 characters, non-blank. The
// entry is two parts: a To: line naming the person, then the unsent message
// itself, which the judge's brief caps at 200 characters. One line feed
// separates the parts; every other control character is rejected.
const text = CONFESSION;
const size = [...text].length;
if (size < 1 || size > MAX_CHARS) {
  throw new Error(`a micro-confession must be 1-${MAX_CHARS} characters, got ${size}`);
}
if (!text.trim()) {
  throw new Error('the confession must not be only whitespace');
}
const lines = text.split('\n');
if (lines.length !== 2 || !lines[0].startsWith('To:') || lines[0].length <= 3) {
  throw new Error('the confession needs a named To: line and one message line');
}
const message = lines[1];
if ([...message].length < 1 || [...message].length > 200) {
  throw new Error('the unsent message must be 1-200 characters');
}
for (const ch of text) {
  const c = ch.charCodeAt(0);
  if (c === 10) continue;
  if (c < 0x20 || c === 0x7f || c === 0x2028 || c === 0x2029) {
    throw new Error('the confession must contain no stray control characters');
  }
}
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const target = join(outDir, 'entry.txt');
writeFileSync(target, text, 'utf8');
chmodSync(target, 0o644);
console.log(`wrote a ${size}-character, two-part unsent confession to ${target}`);
