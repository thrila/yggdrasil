// Merge the verified catalog into the local override; preserve sources added by the user.
const fs = require('node:fs');
const path = require('node:path');
const { units } = require('../electron/source-config.cjs');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const file = path.join(root, 'electron/sources.private.json');
const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
const incoming = [...read('research/sources.jobs.json'), ...read('research/sources.bonus.json'), read('research/sources.adapters.json')[0]];
const seen = new Set(units(existing).map(s => s.board?.toLowerCase() || s.url || s.type));
const additions = incoming.flatMap(s => {
  if (s.type === 'ats') {
    const boards = s.boards.filter(b => !seen.has(b.toLowerCase()));
    boards.forEach(b => seen.add(b.toLowerCase()));
    return boards.length ? [{ ...s, boards }] : [];
  }
  const key = s.url || s.type;
  if (seen.has(key)) return [];
  seen.add(key);
  return [s];
});
fs.writeFileSync(file, JSON.stringify([...existing, ...additions], null, 2) + '\n');
console.log(`Installed ${units(additions).length} new source units in ${file}`);
