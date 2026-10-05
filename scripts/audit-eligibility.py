"""Recheck role evidence from saved API responses; no extra network requests."""
import json, html, re, pathlib

path = pathlib.Path('research/verification.json')
records = json.loads(path.read_text())
for record in records:
    if record['type'] != 'ats' or not record['verified']:
        continue
    request = next((q for q in reversed(record['requests']) if 'application/json' in (q.get('contentType') or '')), None)
    if not request:
        continue
    payload = json.loads(pathlib.Path(request['bodyFile']).read_text())
    jobs = payload if isinstance(payload, list) else payload['jobs']
    matches = []
    for job in jobs:
        title = job.get('title', job.get('text', ''))
        location = job.get('location', job.get('categories', {}).get('location', ''))
        location = location.get('name', '') if isinstance(location, dict) else str(location or '')
        description = job.get('content', job.get('descriptionPlain', '')) or ''
        description = re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]*>', ' ', description)))
        if not re.search(r'engineer|developer|programmer|research|architect|technical staff|data scientist', title, re.I):
            continue
        relocation, remote = [], []
        for occurrence in re.finditer('relocat|visa sponsor', description, re.I):
            context = description[max(0, occurrence.start()-65):occurrence.start()+130]
            if re.search(r'\bno\b|not|unable|cannot|don.t', context, re.I):
                continue
            if re.search('offer|provid|assist|support|package|available', context, re.I):
                relocation.append(context)
        for occurrence in re.finditer(r'\bremote\b|work from home', description, re.I):
            context = description[max(0, occurrence.start()-65):occurrence.start()+100]
            if re.search(r'\bnot\b|\bno\b|unable|cannot|don.t|hybrid|\bon.?site\b|days.{0,20}office|office.{0,20}days', context, re.I):
                continue
            if re.search(r'fully remote|100% remote|remote[- ]first|work(?:ing)? remotely|work from home|remote (?:role|position|opportunity|work)|remote.*?based|based.*?remote', context, re.I):
                remote.append(context)
        flag = job.get('isRemote') or (job.get('workplaceType') or '').lower() == 'remote' or re.search(r'\bremote\b|worldwide|anywhere|home.based', location + ' ' + title, re.I)
        negative = re.search(r'not (?:a |fully )?remote|remote work.{0,40}not.{0,20}(?:available|eligible|offered)|remote.{0,35}will not be considered|not available as fully remote|strictly on.site|requires working on.site|hybrid.{0,30}\d.{0,15}days|\d days.{0,30}office', description, re.I)
        evidence = ('API remote flag/location' if flag else remote[0]) if (flag or remote) and not negative else relocation[0] if relocation else None
        if evidence:
            matches.append({'title': title, 'location': location, 'url': job.get('absolute_url', job.get('hostedUrl', job.get('jobUrl'))), 'evidence': evidence})
    record['matchingRoles'] = len(matches)
    record['eligibilityEvidence'] = matches[:4]
    record['locations'] = list(dict.fromkeys(x['location'] for x in matches))[:10]
path.write_text(json.dumps(records, indent=2) + '\n')
print('Boards with relevant remote/relocation evidence:', sum(r.get('matchingRoles', 0) > 0 for r in records if r['type'] == 'ats' and r['verified']))
