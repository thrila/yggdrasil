// Tagging rules. Edit the patterns to tune tags. Case-insensitive.
const WORK = { // checked against title + location + start of description
  remote: /\bremote\b|work from anywhere|work from home|distributed team|anywhere in the world/i,
  hybrid: /\bhybrid\b/i,
  onsite: /\bon-?site\b|in[- ]office/i,
  relocation: /relocat|visa sponsor|sponsorship/i,
};
const PLACE = { // title + location only
  nigeria: /\bnigeria\b|\blagos\b|\babuja\b|port harcourt|\bibadan\b|\bkano\b|\benugu\b|\bkaduna\b/i,
  "africa-ok": /\bafrica\b|\bemea\b|worldwide|anywhere|\bglobal\b|\bwat\b|\bgmt\b/i,
};
const RESTRICTED = /\b(usa|us|u\.s\.|united states|canada|uk|europe|eu)\b[^,;]*\b(only|based|residents?)\b|\b(usa|us|united states|canada) only\b/i;
const FIELDS = { // title + description
  rust: /\brust\b/i, python: /\bpython\b/i, typescript: /typescript/i,
  zk: /zero[- ]knowledge|\bzk\b|\bsnarks?\b|\bstarks?\b/i, compilers: /compiler|\bllvm\b|\bmlir\b/i,
  "low-latency": /low[- ]latency|\bhft\b|market making|trading systems/i,
  "ml-infra": /ml infra|machine learning|\bmlops\b|\bcuda\b|\bgpu\b/i,
  blockchain: /blockchain|web3|smart contract|solidity/i,
  cryptography: /cryptograph|formal verification|mathematic/i,
  systems: /systems programming|c\+\+|kernel|embedded|distributed systems/i,
  backend: /back-?end/i, fullstack: /full[- ]?stack/i,
};
const LEVEL = { senior: /\bsenior\b|\bstaff\b|\bprincipal\b|\blead\b/i, junior: /\bjunior\b|entry[- ]level|graduate|\bintern(ship)?\b/i };
const FUNDING = { // title + description. Deliberately narrow: bare "grant" also means equity/stock grant in job ads.
  grant: /funding opportunit|funding (cycle|award|programme|program)|request for (proposals|applications|qualifications)|\brfps?\b|\bsbir\b|small business innovation|no[- ]cost agreement|cooperative agreement|notice of (funding|award)|financial assistance (award|opportunit)|\bnsf\b|\bnih\b|\bdarpa\b/i,
  hackathon: /\bhackathons?\b|\bbuildathons?\b|\bjamboree\b|\bdatathons?\b|codefest|case competition|ideathon/i,
  fellowship: /\bfellowships?\b|\bscholarships?\b|\bpostdoctoral\b/i,
};
const hit = (rules, text) => Object.keys(rules).filter((k) => rules[k].test(text));

function tag(title, location, description = "", force = []) {
  const head = `${title} ${location}`;
  const tags = new Set([...hit(WORK, `${head} ${description.slice(0, 1500)}`), ...hit(PLACE, head),
    ...hit(FIELDS, `${title} ${description.slice(0, 3000)}`), ...hit(LEVEL, title),
    ...hit(FUNDING, `${title} ${description.slice(0, 3000)}`), ...force]);
  if (RESTRICTED.test(location || "") && !tags.has("africa-ok")) tags.add("restricted");
  return [...tags].sort();
}
module.exports = { tag };
