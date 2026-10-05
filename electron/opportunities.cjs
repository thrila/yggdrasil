const FUNDING_KINDS = new Set(['grant', 'hackathon', 'fellowship']);

function opportunityKind(item, source = {}) {
  if (FUNDING_KINDS.has(item.kind)) return item.kind;
  const forced = source.force_tags || [];
  for (const kind of ['hackathon', 'grant', 'fellowship']) if (forced.includes(kind)) return kind;
  const title = item.title || '';
  // Hiring a grants manager or an engineer who attends hackathons is still a job.
  if (/\b(engineer|developer|manager|director|officer|recruiter|coordinator)\b/i.test(title)) return 'job';
  if (/hackathon|buildathon|datathon|codefest|ideathon/i.test(title)) return 'hackathon';
  if (/\bgrants?\b|funding opportunit|call for (proposals|applications)|request for proposals/i.test(title)) return 'grant';
  if (/fellowship|scholarship/i.test(title)) return 'fellowship';
  return 'job';
}

function inTab(item, tab) {
  if (!item.active) return false;
  const kind = item.kind || opportunityKind(item, { force_tags: item.tags });
  if (tab === 'grants') return FUNDING_KINDS.has(kind);
  if (kind !== 'job') return false;
  const tags = item.tags || [];
  if (tab === 'nigeria') return tags.includes('nigeria') || (tags.includes('remote') && tags.includes('africa-ok') && !tags.includes('restricted'));
  return tags.includes('remote') || tags.includes('relocation');
}

module.exports = { opportunityKind, inTab };
