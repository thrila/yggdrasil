"""Read publisher pages for advertised feed URLs; never infer /feed paths."""
import concurrent.futures
import html
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request

rows = json.loads(pathlib.Path(sys.argv[1]).read_text())

def discover(row):
    url = row['url']
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Yggdrasil/0.1 (personal feed discovery)'})
        with urllib.request.urlopen(req, timeout=25) as response:
            body = response.read().decode('utf-8', errors='replace')
            base = response.url
        feeds = []
        for element in re.findall(r'<(?:link|a|input)\b[^>]*>', body, re.I):
            attrs = {k.lower(): html.unescape(v) for k, _, v in re.findall(r'([\w-]+)\s*=\s*([\"\'])(.*?)\2', element)}
            link = attrs.get('href') or attrs.get('value')
            if link and (re.search(r'application/(?:rss|atom)\+xml', attrs.get('type', '')) or re.search(r'rss|feed|\.xml(?:$|\?)', link, re.I)):
                link = urllib.parse.urljoin(base, link)
                if link.startswith(('https://', 'http://')) and not re.search(r'comment|feedburner.com/fb|feeds/|rss-feeds', link):
                    feeds.append(link)
        return {**row, 'discoveredFeeds': list(dict.fromkeys(feeds))}
    except Exception as error:
        return {**row, 'error': str(error), 'discoveredFeeds': []}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(discover, rows))
pathlib.Path(sys.argv[2]).write_text(json.dumps(results, indent=2) + '\n')
for result in results:
    print(result['name'], result['discoveredFeeds'], result.get('error', ''))
