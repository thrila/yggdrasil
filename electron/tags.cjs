// Tagging rules. Edit the patterns to tune tags. Case-insensitive.
const WORK = { // checked against title + location + start of description
  remote: /\bremote\b|work from anywhere|work from home|distributed team|anywhere in the world/i,
  hybrid: /\bhybrid\b/i,
  onsite: /\bon-?site\b|in[- ]office/i,
  relocation: /relocat|visa sponsor|sponsorship/i,
};
const PLACE = { // title + location only
  nigeria: /\bnigeria\b|\blagos\b|\babuja\b|port harcourt|\bibadan\b|\bkano\b|\benugu\b|\bkaduna\b/i,
  "africa-ok": /\bafrica\b|worldwide|anywhere/i,
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
  const policy = `${head} ${description}`;
  const tags = new Set([...hit(WORK, policy), ...hit(PLACE, location),
    ...hit(FIELDS, `${title} ${description.slice(0, 3000)}`), ...hit(LEVEL, title),
    ...hit(FUNDING, `${title} ${description.slice(0, 3000)}`), ...force]);
  // A company mentioning remote colleagues does not establish this role's working arrangement.
  if (!WORK.remote.test(head) && !/fully remote|100% remote|remote[- ]first|work(?:ing)? remotely|work from home|remote (?:role|position|opportunity|work)/i.test(description)) tags.delete('remote');
  if (/not (?:a |fully )?remote|no remote (?:work|option)|remote work.{0,40}not (?:available|offered)|remote.{0,40}will not be considered|strictly on.site|requires working on.site|remote work arrangements are not eligible/i.test(policy)) tags.delete('remote');
  if (/\bhybrid\b/i.test(location) || /(?:\d|three|four|five) days.{0,35}(?:the )?office/i.test(description)) tags.delete('remote');
  if (!/(?:offer|provid|assist|support|available|package).{0,65}(?:relocat|visa sponsor)|(?:relocat|visa sponsor).{0,65}(?:offer|provid|assist|support|available|package)/i.test(description)) tags.delete('relocation');
  if (/do(?:es)? not (?:offer|provide|support|sponsor).{0,40}(?:visa|relocation)|no (?:visa )?sponsorship|unable to (?:offer|provide|sponsor).{0,40}(?:visa|relocation)|(?:relocation|visa sponsorship).{0,30}(?:not offered|not available)/i.test(policy)) tags.delete('relocation');
  if (/work from anywhere|anywhere in the world/i.test(policy)) tags.add('africa-ok');
  if (PLACE.nigeria.test(head)) tags.add('nigeria');
  if (RESTRICTED.test(policy) || (/\b(?:US|USA|United States|Canada|UK|United Kingdom|Europe|European Union|LATAM|APAC|EMEA)[\s-]*(?:only|remote)|remote[\s,-]+(?:US|USA|United States|Canada|UK|United Kingdom|Europe|European Union|LATAM|APAC|EMEA)\b/i.test(location) && !PLACE['africa-ok'].test(location))) tags.add('restricted');
  return [...tags].sort();
}
module.exports = { tag };
