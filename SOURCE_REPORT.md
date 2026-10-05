Checked live on 2026-10-05: **117 company boards, 28 worldwide RSS feeds, 15 Nigeria/Africa RSS feeds, 5 public JSON job endpoints, and 6 bonus feeds.** The JSON endpoints include two publishers already represented by RSS, so there are 31 distinct worldwide job-board publishers. The African count is endpoints, including country feeds from MyJobMag.

Each selected ATS endpoint returned a nonempty jobs array. Every selected board landing URL was opened. Every selected RSS URL returned parseable XML with items, and titles were inspected to exclude news-only, poisoned and duplicate feeds. The verifier's counts are snapshot totals across all departments, or feed-window item counts, before title filters. They are **not** promises that every item is relevant, still open, fully remote, or available from Nigeria. “worldwide” is the worldwide bucket; some remote listings are country restricted, while others offer relocation. Check the role's explicit country/visa conditions. EMEA or a compatible timezone does not establish Nigeria eligibility.

Existing Remotive, RemoteOK, Stripe, Palantir, Ramp and Google News sources are excluded. GitLab, Cloudflare, We Work Remotely and HN Jobs shipped in this checkout and are also omitted from the additional catalog. Public access is not a blanket copyright/republication licence; unknown reuse permissions are explicitly labelled.

Verification requests, status codes, timestamps, sampled roles and SHA-256 response hashes are in [verification.json](research/verification.json); raw response bodies are retained locally in the gitignored .cache/source-verification directory. Failed checks are in [unverified.json](research/unverified.json).

### 1. Ready-to-paste JSON

```json
[
  {
    "name": "Company boards: batch 1",
    "type": "ats",
    "boards": [
      "greenhouse:canonical",
      "lever:offchainlabs",
      "ashby:provable",
      "ashby:matter-labs",
      "ashby:alpenlabs",
      "ashby:whetstoneresearch",
      "ashby:trust-wallet",
      "ashby:lightning",
      "ashby:projecteleven",
      "greenhouse:gensyn",
      "greenhouse:ritual",
      "greenhouse:consensys",
      "lever:certik",
      "greenhouse:ondofinance",
      "greenhouse:alpaca",
      "ashby:Keyrock",
      "ashby:luxor",
      "greenhouse:eqvilentjobs",
      "ashby:supabase",
      "greenhouse:grafanalabs",
      "greenhouse:enchargeai36",
      "greenhouse:lemurianlabs",
      "greenhouse:jetbrains",
      "greenhouse:stackblitz",
      "greenhouse:honeycomb"
    ]
  },
  {
    "name": "Company boards: batch 2",
    "type": "ats",
    "boards": [
      "greenhouse:moniepoint",
      "greenhouse:sandtechholdingslimited",
      "ashby:m-kopa",
      "greenhouse:defuselabs",
      "ashby:lucidlink",
      "greenhouse:intelluminc",
      "greenhouse:scaleops",
      "greenhouse:dataiku",
      "greenhouse:superserve",
      "ashby:yotta",
      "greenhouse:turnkeycareers",
      "greenhouse:engine",
      "greenhouse:pulumicorporation",
      "lever:parallelwireless",
      "greenhouse:zencoder",
      "greenhouse:keepersecurity",
      "greenhouse:youcom",
      "lever:airslate",
      "ashby:Gradient",
      "ashby:sentient",
      "ashby:unto-labs",
      "ashby:lucidcomputing",
      "greenhouse:teravision",
      "greenhouse:automox",
      "lever:sysdig"
    ]
  },
  {
    "name": "Company boards: batch 3",
    "type": "ats",
    "boards": [
      "lever:binance",
      "lever:voltus",
      "greenhouse:mariadbplc",
      "greenhouse:rxsense",
      "greenhouse:penninteractive",
      "greenhouse:upgrade",
      "ashby:emergence",
      "ashby:atticus",
      "ashby:g2i",
      "ashby:grai",
      "ashby:space44",
      "lever:accesssoftek",
      "lever:azul",
      "ashby:prelude",
      "ashby:langdock",
      "lever:anchorage",
      "ashby:Linear",
      "greenhouse:focused",
      "greenhouse:colabsoftware",
      "greenhouse:endorlabs",
      "lever:coinmarketcap",
      "greenhouse:tobogganlabs",
      "ashby:gc-ai",
      "ashby:ema",
      "ashby:vanta"
    ]
  },
  {
    "name": "Company boards: batch 4",
    "type": "ats",
    "boards": [
      "ashby:neon",
      "greenhouse:applytoaktos",
      "ashby:share",
      "ashby:brainbaselabs",
      "greenhouse:kernelize",
      "lever:appen-2",
      "greenhouse:modernhealth",
      "ashby:kindred",
      "greenhouse:circleci",
      "greenhouse:xai",
      "greenhouse:tenstorrent",
      "greenhouse:anthropic",
      "greenhouse:sambanovasystems",
      "greenhouse:databricks",
      "greenhouse:lightningai",
      "greenhouse:togetherai",
      "greenhouse:coreweave",
      "ashby:cursor",
      "greenhouse:nebius",
      "ashby:anyscale",
      "ashby:baseten",
      "ashby:character",
      "ashby:lambda",
      "ashby:primeintellect",
      "ashby:cartesia"
    ]
  },
  {
    "name": "Company boards: batch 5",
    "type": "ats",
    "boards": [
      "ashby:etched",
      "ashby:sfcompute",
      "ashby:perplexity",
      "ashby:fluidstack",
      "ashby:cohere",
      "ashby:Liquid-AI",
      "ashby:d-matrix",
      "ashby:friendliai",
      "ashby:cognition",
      "ashby:featherlessai",
      "ashby:openai",
      "ashby:inworld-ai",
      "ashby:poolside",
      "ashby:tensorwave",
      "ashby:runway-ml",
      "ashby:reka",
      "ashby:crusoe"
    ]
  },
  {
    "name": "ClojureJobboard.com",
    "type": "rss",
    "url": "https://clojurejobboard.com/rss.xml",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Authentic Jobs",
    "type": "rss",
    "url": "https://authenticjobs.com/?feed=job_feed&job_types=freelance%2Cfull-time%2Cinternship%2Cpart-time&search_location=remote&job_categories&search_keywords",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Findjobit",
    "type": "rss",
    "url": "https://findjobit.com/jobs/feed",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Golang / Go Jobs",
    "type": "rss",
    "url": "https://www.golangprojects.com/rss.xml",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "FOSS Jobs",
    "type": "rss",
    "url": "https://www.fossjobs.net/rss/all/",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "I ❤ remote.io",
    "type": "rss",
    "url": "https://iloveremote.io/rss/jobs/city/remote.rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "HasJob",
    "type": "rss",
    "url": "https://hasjob.co/feed",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Landing.jobs",
    "type": "rss",
    "url": "https://landing.jobs/feed?remote=true",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "NODESK",
    "type": "rss",
    "url": "https://nodesk.co/remote-jobs/index.xml",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Lara Jobs",
    "type": "rss",
    "url": "https://larajobs.com/feed",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Python Jobs",
    "type": "rss",
    "url": "https://www.python.org/jobs/feed/rss/",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "WordPress Jobs",
    "type": "rss",
    "url": "https://jobs.wordpress.net/feed/",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Himalayas",
    "type": "rss",
    "url": "https://himalayas.app/jobs/rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Jobicy",
    "type": "rss",
    "url": "https://jobicy.com/jobs/feed",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Real Work From Anywhere",
    "type": "rss",
    "url": "https://www.realworkfromanywhere.com/rss.xml",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "elixirjobs",
    "type": "rss",
    "url": "https://elixirjobs.net/rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "cryptocurrencyjobs",
    "type": "rss",
    "url": "https://cryptocurrencyjobs.co/index.xml",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "cryptojobslist",
    "type": "rss",
    "url": "https://api.cryptojobslist.com/jobs.rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "germantechjobs",
    "type": "rss",
    "url": "https://germantechjobs.de/rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "swissdevjobs",
    "type": "rss",
    "url": "https://swissdevjobs.ch/rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "remotefirstjobs",
    "type": "rss",
    "url": "https://remotefirstjobs.com/remote-jobs.rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "pyjobs",
    "type": "rss",
    "url": "https://www.pyjobs.com/rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Hot Nigerian Jobs",
    "type": "rss",
    "url": "https://www.hotnigerianjobs.com/feed/rss.xml",
    "force_tags": [
      "nigeria"
    ],
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "MyJobMag Kenya",
    "type": "rss",
    "url": "https://www.myjobmag.co.ke/jobsxml.xml",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "MyJobMag Nigeria",
    "type": "rss",
    "url": "https://www.myjobmag.com/jobsxml.xml",
    "force_tags": [
      "nigeria"
    ],
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Joblist Nigeria",
    "type": "rss",
    "url": "https://joblistnigeria.com/feed",
    "force_tags": [
      "nigeria"
    ],
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Career Point Kenya",
    "type": "rss",
    "url": "https://www.careerpointkenya.co.ke/feed/",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "devopsjobs",
    "type": "rss",
    "url": "https://devopsjobs.io/jobs.rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Jobweb Kenya 2",
    "type": "rss",
    "url": "https://jobwebkenya.com/feed/?post_type=job_listing",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Warp Jobs",
    "type": "rss",
    "url": "https://warpjobs.com/feed.xml",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "RecruitHub Africa",
    "type": "rss",
    "url": "https://recruithub.recruitmentroom.net/jobs.xml",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "MyJobMag South Africa",
    "type": "rss",
    "url": "https://www.myjobmag.co.za/jobsxml.xml",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Jobweb Ethiopia 2",
    "type": "rss",
    "url": "https://jobwebethiopia.com/feed/?post_type=job_listing",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Jobweb Uganda 2",
    "type": "rss",
    "url": "https://jobwebuganda.com/feed/?post_type=job_listing",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Jobs in Kenya",
    "type": "rss",
    "url": "https://www.jobsinkenya.co.ke/wpjobboard/xml/rss/?filter=active",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "iYouth South Africa",
    "type": "rss",
    "url": "https://iyouth.co.za/rss/latest-posts",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Top Job Seeker South Africa",
    "type": "rss",
    "url": "https://topjobseeker.com/?feed=job_feed&job_types=contract%2Cfreelance%2Cfull-time%2Cinternship%2Cpart-time%2Cremote%2Ctemporary%2Cvolunteer&search_location=South+Africa&job_categories&search_keywords",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Jobscanner",
    "type": "rss",
    "url": "https://jobscanner.online/feed.xml",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Hello Uganda",
    "type": "rss",
    "url": "https://jobs.hellouganda.com/rss/all/",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "YubHub Rust",
    "type": "rss",
    "url": "https://feeds.yubhub.co/facet/skill/rust.rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "JobsCollider",
    "type": "rss",
    "url": "https://jobscollider.com/remote-jobs.rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "Alouadifa Morocco",
    "type": "rss",
    "url": "https://alouadifa.ma/feed/",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  },
  {
    "name": "TensorHack AI jobs",
    "type": "rss",
    "url": "https://tensorhack.com/data/jobs.rss",
    "include": [
      "engineer",
      "developer",
      "software",
      "backend",
      "fullstack",
      "full stack",
      "research",
      "scientist",
      "technical staff",
      "devops",
      "rust",
      "python",
      "typescript",
      "ingénieur",
      "informatique",
      "développeur"
    ]
  }
]
```

### 2. Plain URL list

```text
https://job-boards.greenhouse.io/canonical
https://jobs.lever.co/offchainlabs
https://jobs.ashbyhq.com/provable
https://jobs.ashbyhq.com/matter-labs
https://jobs.ashbyhq.com/alpenlabs
https://jobs.ashbyhq.com/whetstoneresearch
https://jobs.ashbyhq.com/trust-wallet
https://jobs.ashbyhq.com/lightning
https://jobs.ashbyhq.com/projecteleven
https://job-boards.greenhouse.io/gensyn
https://job-boards.greenhouse.io/ritual
https://job-boards.greenhouse.io/consensys
https://jobs.lever.co/certik
https://job-boards.greenhouse.io/ondofinance
https://job-boards.greenhouse.io/alpaca
https://jobs.ashbyhq.com/Keyrock
https://jobs.ashbyhq.com/luxor
https://job-boards.greenhouse.io/eqvilentjobs
https://jobs.ashbyhq.com/supabase
https://job-boards.greenhouse.io/grafanalabs
https://job-boards.greenhouse.io/enchargeai36
https://job-boards.greenhouse.io/lemurianlabs
https://job-boards.greenhouse.io/jetbrains
https://job-boards.greenhouse.io/stackblitz
https://job-boards.greenhouse.io/honeycomb
https://job-boards.greenhouse.io/moniepoint
https://job-boards.greenhouse.io/sandtechholdingslimited
https://jobs.ashbyhq.com/m-kopa
https://job-boards.greenhouse.io/defuselabs
https://jobs.ashbyhq.com/lucidlink
https://job-boards.greenhouse.io/intelluminc
https://job-boards.greenhouse.io/scaleops
https://job-boards.greenhouse.io/dataiku
https://job-boards.greenhouse.io/superserve
https://jobs.ashbyhq.com/yotta
https://job-boards.greenhouse.io/turnkeycareers
https://job-boards.greenhouse.io/engine
https://job-boards.greenhouse.io/pulumicorporation
https://jobs.lever.co/parallelwireless
https://job-boards.greenhouse.io/zencoder
https://job-boards.greenhouse.io/keepersecurity
https://job-boards.greenhouse.io/youcom
https://jobs.lever.co/airslate
https://jobs.ashbyhq.com/Gradient
https://jobs.ashbyhq.com/sentient
https://jobs.ashbyhq.com/unto-labs
https://jobs.ashbyhq.com/lucidcomputing
https://job-boards.greenhouse.io/teravision
https://job-boards.greenhouse.io/automox
https://jobs.lever.co/sysdig
https://jobs.lever.co/binance
https://jobs.lever.co/voltus
https://job-boards.greenhouse.io/mariadbplc
https://job-boards.greenhouse.io/rxsense
https://job-boards.greenhouse.io/penninteractive
https://job-boards.greenhouse.io/upgrade
https://jobs.ashbyhq.com/emergence
https://jobs.ashbyhq.com/atticus
https://jobs.ashbyhq.com/g2i
https://jobs.ashbyhq.com/grai
https://jobs.ashbyhq.com/space44
https://jobs.lever.co/accesssoftek
https://jobs.lever.co/azul
https://jobs.ashbyhq.com/prelude
https://jobs.ashbyhq.com/langdock
https://jobs.lever.co/anchorage
https://jobs.ashbyhq.com/Linear
https://job-boards.greenhouse.io/focused
https://job-boards.greenhouse.io/colabsoftware
https://job-boards.greenhouse.io/endorlabs
https://jobs.lever.co/coinmarketcap
https://job-boards.greenhouse.io/tobogganlabs
https://jobs.ashbyhq.com/gc-ai
https://jobs.ashbyhq.com/ema
https://jobs.ashbyhq.com/vanta
https://jobs.ashbyhq.com/neon
https://job-boards.greenhouse.io/applytoaktos
https://jobs.ashbyhq.com/share
https://jobs.ashbyhq.com/brainbaselabs
https://job-boards.greenhouse.io/kernelize
https://jobs.lever.co/appen-2
https://job-boards.greenhouse.io/modernhealth
https://jobs.ashbyhq.com/kindred
https://job-boards.greenhouse.io/circleci
https://job-boards.greenhouse.io/xai
https://job-boards.greenhouse.io/tenstorrent
https://job-boards.greenhouse.io/anthropic
https://job-boards.greenhouse.io/sambanovasystems
https://job-boards.greenhouse.io/databricks
https://job-boards.greenhouse.io/lightningai
https://job-boards.greenhouse.io/togetherai
https://job-boards.greenhouse.io/coreweave
https://jobs.ashbyhq.com/cursor
https://job-boards.greenhouse.io/nebius
https://jobs.ashbyhq.com/anyscale
https://jobs.ashbyhq.com/baseten
https://jobs.ashbyhq.com/character
https://jobs.ashbyhq.com/lambda
https://jobs.ashbyhq.com/primeintellect
https://jobs.ashbyhq.com/cartesia
https://jobs.ashbyhq.com/etched
https://jobs.ashbyhq.com/sfcompute
https://jobs.ashbyhq.com/perplexity
https://jobs.ashbyhq.com/fluidstack
https://jobs.ashbyhq.com/cohere
https://jobs.ashbyhq.com/Liquid-AI
https://jobs.ashbyhq.com/d-matrix
https://jobs.ashbyhq.com/friendliai
https://jobs.ashbyhq.com/cognition
https://jobs.ashbyhq.com/featherlessai
https://jobs.ashbyhq.com/openai
https://jobs.ashbyhq.com/inworld-ai
https://jobs.ashbyhq.com/poolside
https://jobs.ashbyhq.com/tensorwave
https://jobs.ashbyhq.com/runway-ml
https://jobs.ashbyhq.com/reka
https://jobs.ashbyhq.com/crusoe
https://clojurejobboard.com/rss.xml
https://authenticjobs.com/?feed=job_feed&job_types=freelance%2Cfull-time%2Cinternship%2Cpart-time&search_location=remote&job_categories&search_keywords
https://findjobit.com/jobs/feed
https://www.golangprojects.com/rss.xml
https://www.fossjobs.net/rss/all/
https://iloveremote.io/rss/jobs/city/remote.rss
https://hasjob.co/feed
https://landing.jobs/feed?remote=true
https://nodesk.co/remote-jobs/index.xml
https://larajobs.com/feed
https://www.python.org/jobs/feed/rss/
https://jobs.wordpress.net/feed/
https://himalayas.app/jobs/rss
https://jobicy.com/jobs/feed
https://www.realworkfromanywhere.com/rss.xml
https://elixirjobs.net/rss
https://cryptocurrencyjobs.co/index.xml
https://api.cryptojobslist.com/jobs.rss
https://germantechjobs.de/rss
https://swissdevjobs.ch/rss
https://remotefirstjobs.com/remote-jobs.rss
https://www.pyjobs.com/rss
https://www.hotnigerianjobs.com/feed/rss.xml
https://www.myjobmag.co.ke/jobsxml.xml
https://www.myjobmag.com/jobsxml.xml
https://joblistnigeria.com/feed
https://www.careerpointkenya.co.ke/feed/
https://devopsjobs.io/jobs.rss
https://jobwebkenya.com/feed/?post_type=job_listing
https://warpjobs.com/feed.xml
https://recruithub.recruitmentroom.net/jobs.xml
https://www.myjobmag.co.za/jobsxml.xml
https://jobwebethiopia.com/feed/?post_type=job_listing
https://jobwebuganda.com/feed/?post_type=job_listing
https://www.jobsinkenya.co.ke/wpjobboard/xml/rss/?filter=active
https://iyouth.co.za/rss/latest-posts
https://topjobseeker.com/?feed=job_feed&job_types=contract%2Cfreelance%2Cfull-time%2Cinternship%2Cpart-time%2Cremote%2Ctemporary%2Cvolunteer&search_location=South+Africa&job_categories&search_keywords
https://jobscanner.online/feed.xml
https://jobs.hellouganda.com/rss/all/
https://feeds.yubhub.co/facet/skill/rust.rss
https://jobscollider.com/remote-jobs.rss
https://alouadifa.ma/feed/
https://tensorhack.com/data/jobs.rss
```

### 3. Table

Provider rules: [Greenhouse GET/auth docs](https://docs.greenhouse.io/job-board.html), [Lever public postings API](https://github.com/lever/postings-api), [Ashby public postings API](https://developers.ashbyhq.com/docs/public-job-posting-api), [Himalayas RSS attribution](https://himalayas.app/docs/remote-jobs-rss), [Himalayas API rules](https://github.com/Himalayas-App/remote-jobs-api), [Jobicy fair use](https://github.com/Jobicy/remote-jobs-api), [MyJobMag terms](https://www.myjobmag.com/terms), [RemoteFirstJobs aggregator use](https://remotefirstjobs.com/rss), [YubHub attribution](https://yubhub.co/free-job-feeds/), [HireWeb3 rules](https://www.hireweb3.io/rss), [JobsCollider rules](https://github.com/JobsCollider/remote-jobs-rss), [TensorHack exports](https://tensorhack.com/data), [TensorHack terms](https://tensorhack.com/terms). No claim of an employer-content licence follows from ATS API documentation.

| Name | Type | Verified (yes/no) | Open roles (approx.) | Region (worldwide/Nigeria/Africa) | Key needed | Notes or restrictions |
|---|---|---|---:|---|---|---|
| [Canonical](https://boards-api.greenhouse.io/v1/boards/canonical/jobs) | ATS / greenhouse | yes | 310 | worldwide | no | 152 relevant remote/relocation matches; Home based - Worldwide; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Offchain Labs](https://api.lever.co/v0/postings/offchainlabs?mode=json) | ATS / lever | yes | 11 | worldwide | no | 6 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Provable](https://api.ashbyhq.com/posting-api/job-board/provable) | ATS / ashby | yes | 2 | worldwide | no | 1 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Matter Labs](https://api.ashbyhq.com/posting-api/job-board/matter-labs) | ATS / ashby | yes | 5 | worldwide | no | 3 relevant remote/relocation matches; New York; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Alpen Labs](https://api.ashbyhq.com/posting-api/job-board/alpenlabs) | ATS / ashby | yes | 5 | worldwide | no | 2 relevant remote/relocation matches; Remote ; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Whetstone Research](https://api.ashbyhq.com/posting-api/job-board/whetstoneresearch) | ATS / ashby | yes | 5 | worldwide | no | 3 relevant remote/relocation matches; Global; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Trust Wallet](https://api.ashbyhq.com/posting-api/job-board/trust-wallet) | ATS / ashby | yes | 14 | worldwide | no | 8 relevant remote/relocation matches; Remote - Global; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Lightning Labs](https://api.ashbyhq.com/posting-api/job-board/lightning) | ATS / ashby | yes | 14 | worldwide | no | 10 relevant remote/relocation matches; Lightning Labs; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Project Eleven](https://api.ashbyhq.com/posting-api/job-board/projecteleven) | ATS / ashby | yes | 2 | worldwide | no | 2 relevant remote/relocation matches; United Kingdom; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Gensyn](https://boards-api.greenhouse.io/v1/boards/gensyn/jobs) | ATS / greenhouse | yes | 2 | worldwide | no | 1 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Ritual](https://boards-api.greenhouse.io/v1/boards/ritual/jobs) | ATS / greenhouse | yes | 15 | worldwide | no | 11 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Consensys](https://boards-api.greenhouse.io/v1/boards/consensys/jobs) | ATS / greenhouse | yes | 7 | worldwide | no | 1 relevant remote/relocation matches; United States - Remote, EMEA - Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [CertiK](https://api.lever.co/v0/postings/certik?mode=json) | ATS / lever | yes | 29 | worldwide | no | 9 relevant remote/relocation matches; US / Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Ondo Finance](https://boards-api.greenhouse.io/v1/boards/ondofinance/jobs) | ATS / greenhouse | yes | 22 | worldwide | no | 14 relevant remote/relocation matches; United States; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Alpaca](https://boards-api.greenhouse.io/v1/boards/alpaca/jobs) | ATS / greenhouse | yes | 71 | worldwide | no | 29 relevant remote/relocation matches; Remote - Global Anywhere; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Keyrock](https://api.ashbyhq.com/posting-api/job-board/Keyrock) | ATS / ashby | yes | 10 | worldwide | no | 5 relevant remote/relocation matches; New York; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Luxor](https://api.ashbyhq.com/posting-api/job-board/luxor) | ATS / ashby | yes | 3 | worldwide | no | 2 relevant remote/relocation matches; Worldwide, Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Eqvilent](https://boards-api.greenhouse.io/v1/boards/eqvilentjobs/jobs) | ATS / greenhouse | yes | 24 | worldwide | no | 11 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Supabase](https://api.ashbyhq.com/posting-api/job-board/supabase) | ATS / ashby | yes | 48 | worldwide | no | 35 relevant remote/relocation matches; Remote, AMER; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Grafana Labs](https://boards-api.greenhouse.io/v1/boards/grafanalabs/jobs) | ATS / greenhouse | yes | 121 | worldwide | no | 72 relevant remote/relocation matches; United States (Remote); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [EnCharge AI](https://boards-api.greenhouse.io/v1/boards/enchargeai36/jobs) | ATS / greenhouse | yes | 26 | worldwide | no | 9 relevant remote/relocation matches; Remote-US, Canada, Germany and Norway; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Lemurian Labs](https://boards-api.greenhouse.io/v1/boards/lemurianlabs/jobs) | ATS / greenhouse | yes | 6 | worldwide | no | 1 relevant remote/relocation matches; Santa Clara, California, United States, Toronto, Ontario, Canada, Unit; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [JetBrains](https://boards-api.greenhouse.io/v1/boards/jetbrains/jobs) | ATS / greenhouse | yes | 67 | worldwide | no | 27 relevant remote/relocation matches; Amsterdam, Netherlands; Belgrade, Serbia; Berlin, Germany; Limassol, C; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [StackBlitz](https://boards-api.greenhouse.io/v1/boards/stackblitz/jobs) | ATS / greenhouse | yes | 7 | worldwide | no | 4 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Honeycomb](https://boards-api.greenhouse.io/v1/boards/honeycomb/jobs) | ATS / greenhouse | yes | 20 | worldwide | no | 8 relevant remote/relocation matches; Remote - United States; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Moniepoint](https://boards-api.greenhouse.io/v1/boards/moniepoint/jobs) | ATS / greenhouse | yes | 148 | Nigeria | no | 58 relevant remote/relocation matches; Remote, Poland; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Sand Technologies](https://boards-api.greenhouse.io/v1/boards/sandtechholdingslimited/jobs) | ATS / greenhouse | yes | 46 | Africa | no | 8 relevant remote/relocation matches; Democratic Republic of Congo ; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [M-KOPA](https://api.ashbyhq.com/posting-api/job-board/m-kopa) | ATS / ashby | yes | 37 | Africa | no | 4 relevant remote/relocation matches; Nairobi; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [defuselabs](https://boards-api.greenhouse.io/v1/boards/defuselabs/jobs) | ATS / greenhouse | yes | 1 | worldwide | no | 1 relevant remote/relocation matches; Global - Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [lucidlink](https://api.ashbyhq.com/posting-api/job-board/lucidlink) | ATS / ashby | yes | 6 | worldwide | no | 4 relevant remote/relocation matches; US Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [intelluminc](https://boards-api.greenhouse.io/v1/boards/intelluminc/jobs) | ATS / greenhouse | yes | 3 | worldwide | no | 1 relevant remote/relocation matches; Remote, United States; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [scaleops](https://boards-api.greenhouse.io/v1/boards/scaleops/jobs) | ATS / greenhouse | yes | 57 | worldwide | no | 6 relevant remote/relocation matches; United States - Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [dataiku](https://boards-api.greenhouse.io/v1/boards/dataiku/jobs) | ATS / greenhouse | yes | 21 | worldwide | no | 4 relevant remote/relocation matches; United States, Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [superserve](https://boards-api.greenhouse.io/v1/boards/superserve/jobs) | ATS / greenhouse | yes | 1 | worldwide | no | 1 relevant remote/relocation matches; San Francisco, Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [yotta](https://api.ashbyhq.com/posting-api/job-board/yotta) | ATS / ashby | yes | 4 | worldwide | no | 3 relevant remote/relocation matches; United States; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [turnkeycareers](https://boards-api.greenhouse.io/v1/boards/turnkeycareers/jobs) | ATS / greenhouse | yes | 7 | worldwide | no | 4 relevant remote/relocation matches; United States (Remote); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [engine](https://boards-api.greenhouse.io/v1/boards/engine/jobs) | ATS / greenhouse | yes | 80 | worldwide | no | 8 relevant remote/relocation matches; Remote - US; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Pulumi](https://boards-api.greenhouse.io/v1/boards/pulumicorporation/jobs) | ATS / greenhouse | yes | 5 | worldwide | no | 2 relevant remote/relocation matches; PST; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [parallelwireless](https://api.lever.co/v0/postings/parallelwireless?mode=json) | ATS / lever | yes | 47 | worldwide | no | 8 relevant remote/relocation matches; Malaysia; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [zencoder](https://boards-api.greenhouse.io/v1/boards/zencoder/jobs) | ATS / greenhouse | yes | 3 | worldwide | no | 3 relevant remote/relocation matches; Europe, Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [keepersecurity](https://boards-api.greenhouse.io/v1/boards/keepersecurity/jobs) | ATS / greenhouse | yes | 89 | worldwide | no | 24 relevant remote/relocation matches; Remote, Ireland; Remote, UK; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [youcom](https://boards-api.greenhouse.io/v1/boards/youcom/jobs) | ATS / greenhouse | yes | 7 | worldwide | no | 3 relevant remote/relocation matches; San Francisco (Remote); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [airslate](https://api.lever.co/v0/postings/airslate?mode=json) | ATS / lever | yes | 13 | worldwide | no | 3 relevant remote/relocation matches; Poland; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Gradient](https://api.ashbyhq.com/posting-api/job-board/Gradient) | ATS / ashby | yes | 5 | worldwide | no | 2 relevant remote/relocation matches; Anywhere; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [sentient](https://api.ashbyhq.com/posting-api/job-board/sentient) | ATS / ashby | yes | 1 | worldwide | no | 1 relevant remote/relocation matches; Remote - APAC ( Singapore ); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [unto-labs](https://api.ashbyhq.com/posting-api/job-board/unto-labs) | ATS / ashby | yes | 3 | worldwide | no | 1 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [lucidcomputing](https://api.ashbyhq.com/posting-api/job-board/lucidcomputing) | ATS / ashby | yes | 9 | worldwide | no | 5 relevant remote/relocation matches; San Francisco; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [teravision](https://boards-api.greenhouse.io/v1/boards/teravision/jobs) | ATS / greenhouse | yes | 4 | worldwide | no | 4 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [automox](https://boards-api.greenhouse.io/v1/boards/automox/jobs) | ATS / greenhouse | yes | 4 | worldwide | no | 1 relevant remote/relocation matches; Remote - Austin, TX - Denver, CO - Tampa, FL; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [sysdig](https://api.lever.co/v0/postings/sysdig?mode=json) | ATS / lever | yes | 29 | worldwide | no | 16 relevant remote/relocation matches; Flexible - USA; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [binance](https://api.lever.co/v0/postings/binance?mode=json) | ATS / lever | yes | 314 | worldwide | no | 101 relevant remote/relocation matches; Asia; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [voltus](https://api.lever.co/v0/postings/voltus?mode=json) | ATS / lever | yes | 17 | worldwide | no | 2 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [MariaDB](https://boards-api.greenhouse.io/v1/boards/mariadbplc/jobs) | ATS / greenhouse | yes | 23 | worldwide | no | 15 relevant remote/relocation matches; Remote - Georgia; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [rxsense](https://boards-api.greenhouse.io/v1/boards/rxsense/jobs) | ATS / greenhouse | yes | 5 | worldwide | no | 3 relevant remote/relocation matches; Remote-US; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [penninteractive](https://boards-api.greenhouse.io/v1/boards/penninteractive/jobs) | ATS / greenhouse | yes | 40 | worldwide | no | 20 relevant remote/relocation matches; Remote, United States ; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [upgrade](https://boards-api.greenhouse.io/v1/boards/upgrade/jobs) | ATS / greenhouse | yes | 35 | worldwide | no | 5 relevant remote/relocation matches; Canada (Remote); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [emergence](https://api.ashbyhq.com/posting-api/job-board/emergence) | ATS / ashby | yes | 15 | worldwide | no | 2 relevant remote/relocation matches; India; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [atticus](https://api.ashbyhq.com/posting-api/job-board/atticus) | ATS / ashby | yes | 16 | worldwide | no | 6 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [g2i](https://api.ashbyhq.com/posting-api/job-board/g2i) | ATS / ashby | yes | 23 | worldwide | no | 17 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [grai](https://api.ashbyhq.com/posting-api/job-board/grai) | ATS / ashby | yes | 6 | worldwide | no | 4 relevant remote/relocation matches; Poland; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [space44](https://api.ashbyhq.com/posting-api/job-board/space44) | ATS / ashby | yes | 5 | worldwide | no | 5 relevant remote/relocation matches; European Union; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [accesssoftek](https://api.lever.co/v0/postings/accesssoftek?mode=json) | ATS / lever | yes | 2 | worldwide | no | 2 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [azul](https://api.lever.co/v0/postings/azul?mode=json) | ATS / lever | yes | 14 | worldwide | no | 2 relevant remote/relocation matches; India - Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [prelude](https://api.ashbyhq.com/posting-api/job-board/prelude) | ATS / ashby | yes | 15 | worldwide | no | 3 relevant remote/relocation matches; Paris, France; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [langdock](https://api.ashbyhq.com/posting-api/job-board/langdock) | ATS / ashby | yes | 26 | worldwide | no | 1 relevant remote/relocation matches; Berlin; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [anchorage](https://api.lever.co/v0/postings/anchorage?mode=json) | ATS / lever | yes | 21 | worldwide | no | 3 relevant remote/relocation matches; United States; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Linear](https://api.ashbyhq.com/posting-api/job-board/Linear) | ATS / ashby | yes | 30 | worldwide | no | 12 relevant remote/relocation matches; Europe; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [focused](https://boards-api.greenhouse.io/v1/boards/focused/jobs) | ATS / greenhouse | yes | 25 | worldwide | no | 3 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [colabsoftware](https://boards-api.greenhouse.io/v1/boards/colabsoftware/jobs) | ATS / greenhouse | yes | 28 | worldwide | no | 9 relevant remote/relocation matches; Boston, Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [endorlabs](https://boards-api.greenhouse.io/v1/boards/endorlabs/jobs) | ATS / greenhouse | yes | 29 | worldwide | no | 2 relevant remote/relocation matches; Remote US (EST); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [coinmarketcap](https://api.lever.co/v0/postings/coinmarketcap?mode=json) | ATS / lever | yes | 7 | worldwide | no | 2 relevant remote/relocation matches; Global; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [tobogganlabs](https://boards-api.greenhouse.io/v1/boards/tobogganlabs/jobs) | ATS / greenhouse | yes | 11 | worldwide | no | 6 relevant remote/relocation matches; Montréal, Quebec, Canada; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [gc-ai](https://api.ashbyhq.com/posting-api/job-board/gc-ai) | ATS / ashby | yes | 26 | worldwide | no | 8 relevant remote/relocation matches; San Mateo, California; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [ema](https://api.ashbyhq.com/posting-api/job-board/ema) | ATS / ashby | yes | 41 | worldwide | no | 6 relevant remote/relocation matches; United States; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [vanta](https://api.ashbyhq.com/posting-api/job-board/vanta) | ATS / ashby | yes | 83 | worldwide | no | 33 relevant remote/relocation matches; Remote U.S.; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [neon](https://api.ashbyhq.com/posting-api/job-board/neon) | ATS / ashby | yes | 4 | worldwide | no | 1 relevant remote/relocation matches; Asia \| South Korea; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [applytoaktos](https://boards-api.greenhouse.io/v1/boards/applytoaktos/jobs) | ATS / greenhouse | yes | 10 | worldwide | no | 6 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [share](https://api.ashbyhq.com/posting-api/job-board/share) | ATS / ashby | yes | 9 | worldwide | no | 6 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [brainbaselabs](https://api.ashbyhq.com/posting-api/job-board/brainbaselabs) | ATS / ashby | yes | 6 | worldwide | no | 1 relevant remote/relocation matches; Remote (EMEA); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [kernelize](https://boards-api.greenhouse.io/v1/boards/kernelize/jobs) | ATS / greenhouse | yes | 2 | worldwide | no | 2 relevant remote/relocation matches; Remote early stage startup that prefers employees located in the USA o; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [appen-2](https://api.lever.co/v0/postings/appen-2?mode=json) | ATS / lever | yes | 15 | worldwide | no | 1 relevant remote/relocation matches; Remote India; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [modernhealth](https://boards-api.greenhouse.io/v1/boards/modernhealth/jobs) | ATS / greenhouse | yes | 11 | worldwide | no | 2 relevant remote/relocation matches; Remote - US; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [kindred](https://api.ashbyhq.com/posting-api/job-board/kindred) | ATS / ashby | yes | 7 | worldwide | no | 2 relevant remote/relocation matches; Remote - US or Canada; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [circleci](https://boards-api.greenhouse.io/v1/boards/circleci/jobs) | ATS / greenhouse | yes | 12 | worldwide | no | 3 relevant remote/relocation matches; Canada (Remote), United States (Remote), United Kingdom (Remote); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [xAI](https://boards-api.greenhouse.io/v1/boards/xai/jobs) | ATS / greenhouse | yes | 301 | worldwide | no | 2 relevant remote/relocation matches; Remote International; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Tenstorrent](https://boards-api.greenhouse.io/v1/boards/tenstorrent/jobs) | ATS / greenhouse | yes | 130 | worldwide | no | 25 relevant remote/relocation matches; Santa Clara, California, United States; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Anthropic](https://boards-api.greenhouse.io/v1/boards/anthropic/jobs) | ATS / greenhouse | yes | 639 | worldwide | no | 31 relevant remote/relocation matches; Remote-Friendly, United States; San Francisco, CA \| Washington, DC; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [SambaNova](https://boards-api.greenhouse.io/v1/boards/sambanovasystems/jobs) | ATS / greenhouse | yes | 63 | worldwide | no | 2 relevant remote/relocation matches; Austin, Texas, United States; Remote - US; San Jose, California, Unite; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Databricks](https://boards-api.greenhouse.io/v1/boards/databricks/jobs) | ATS / greenhouse | yes | 888 | worldwide | no | 49 relevant remote/relocation matches; Finland; Remote - Denmark; Stockholm, Sweden; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Lightning AI](https://boards-api.greenhouse.io/v1/boards/lightningai/jobs) | ATS / greenhouse | yes | 54 | worldwide | no | 7 relevant remote/relocation matches; Philippines; Singapore; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Together AI](https://boards-api.greenhouse.io/v1/boards/togetherai/jobs) | ATS / greenhouse | yes | 77 | worldwide | no | 18 relevant remote/relocation matches; San Francisco; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [CoreWeave](https://boards-api.greenhouse.io/v1/boards/coreweave/jobs) | ATS / greenhouse | yes | 315 | worldwide | no | 3 relevant remote/relocation matches; Sunnyvale, CA / San Francisco, CA / Bellevue, WA; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Cursor](https://api.ashbyhq.com/posting-api/job-board/cursor) | ATS / ashby | yes | 132 | worldwide | no | 19 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Nebius](https://boards-api.greenhouse.io/v1/boards/nebius/jobs) | ATS / greenhouse | yes | 365 | worldwide | no | 91 relevant remote/relocation matches; Remote - Europe; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Anyscale](https://api.ashbyhq.com/posting-api/job-board/anyscale) | ATS / ashby | yes | 20 | worldwide | no | 8 relevant remote/relocation matches; San Francisco; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Baseten](https://api.ashbyhq.com/posting-api/job-board/baseten) | ATS / ashby | yes | 105 | worldwide | no | 42 relevant remote/relocation matches; San Francisco; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Character.AI](https://api.ashbyhq.com/posting-api/job-board/character) | ATS / ashby | yes | 13 | worldwide | no | 9 relevant remote/relocation matches; Redwood City, CA; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Lambda](https://api.ashbyhq.com/posting-api/job-board/lambda) | ATS / ashby | yes | 90 | worldwide | no | 43 relevant remote/relocation matches; San Francisco Office (Fremont St); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Prime Intellect](https://api.ashbyhq.com/posting-api/job-board/primeintellect) | ATS / ashby | yes | 30 | worldwide | no | 15 relevant remote/relocation matches; San Francisco; relocation/sponsorship mentioned in sampled role. Employer content licence unconfirmed; preserve links. |
| [Cartesia](https://api.ashbyhq.com/posting-api/job-board/cartesia) | ATS / ashby | yes | 31 | worldwide | no | 21 relevant remote/relocation matches; *HQ - San Francisco, CA; relocation/sponsorship mentioned in sampled role. Employer content licence unconfirmed; preserve links. |
| [Etched](https://api.ashbyhq.com/posting-api/job-board/etched) | ATS / ashby | yes | 108 | worldwide | no | 49 relevant remote/relocation matches; San Jose; relocation/sponsorship mentioned in sampled role. Employer content licence unconfirmed; preserve links. |
| [SF Compute](https://api.ashbyhq.com/posting-api/job-board/sfcompute) | ATS / ashby | yes | 8 | worldwide | no | 3 relevant remote/relocation matches; San Francisco, CA; relocation/sponsorship mentioned in sampled role. Employer content licence unconfirmed; preserve links. |
| [Perplexity](https://api.ashbyhq.com/posting-api/job-board/perplexity) | ATS / ashby | yes | 127 | worldwide | no | 14 relevant remote/relocation matches; Belgrade; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [FluidStack](https://api.ashbyhq.com/posting-api/job-board/fluidstack) | ATS / ashby | yes | 254 | worldwide | no | 20 relevant remote/relocation matches; Austin, TX; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Cohere](https://api.ashbyhq.com/posting-api/job-board/cohere) | ATS / ashby | yes | 137 | worldwide | no | 69 relevant remote/relocation matches; Toronto; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Liquid AI](https://api.ashbyhq.com/posting-api/job-board/Liquid-AI) | ATS / ashby | yes | 20 | worldwide | no | 14 relevant remote/relocation matches; San Francisco; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [d-Matrix](https://api.ashbyhq.com/posting-api/job-board/d-matrix) | ATS / ashby | yes | 33 | worldwide | no | 25 relevant remote/relocation matches; Santa Clara; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [FriendliAI](https://api.ashbyhq.com/posting-api/job-board/friendliai) | ATS / ashby | yes | 19 | worldwide | no | 8 relevant remote/relocation matches; San Francisco; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Cognition](https://api.ashbyhq.com/posting-api/job-board/cognition) | ATS / ashby | yes | 101 | worldwide | no | 9 relevant remote/relocation matches; London; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Featherless AI](https://api.ashbyhq.com/posting-api/job-board/featherlessai) | ATS / ashby | yes | 17 | worldwide | no | 11 relevant remote/relocation matches; Remote (world); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [OpenAI](https://api.ashbyhq.com/posting-api/job-board/openai) | ATS / ashby | yes | 828 | worldwide | no | 342 relevant remote/relocation matches; San Francisco; relocation/sponsorship mentioned in sampled role. Employer content licence unconfirmed; preserve links. |
| [Inworld AI](https://api.ashbyhq.com/posting-api/job-board/inworld-ai) | ATS / ashby | yes | 20 | worldwide | no | 12 relevant remote/relocation matches; Mountain View, California, USA; relocation/sponsorship mentioned in sampled role. Employer content licence unconfirmed; preserve links. |
| [Poolside](https://api.ashbyhq.com/posting-api/job-board/poolside) | ATS / ashby | yes | 2 | worldwide | no | 2 relevant remote/relocation matches; Remote (EMEA); remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [TensorWave](https://api.ashbyhq.com/posting-api/job-board/tensorwave) | ATS / ashby | yes | 38 | worldwide | no | 13 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Runway](https://api.ashbyhq.com/posting-api/job-board/runway-ml) | ATS / ashby | yes | 46 | worldwide | no | 18 relevant remote/relocation matches; Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Reka AI](https://api.ashbyhq.com/posting-api/job-board/reka) | ATS / ashby | yes | 9 | worldwide | no | 6 relevant remote/relocation matches; US, UK, Remote; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [Crusoe](https://api.ashbyhq.com/posting-api/job-board/crusoe) | ATS / ashby | yes | 351 | worldwide | no | 3 relevant remote/relocation matches; Remote - US; remote geography varies, sponsorship unconfirmed. Employer content licence unconfirmed; preserve links. |
| [ClojureJobboard.com](https://clojurejobboard.com/rss.xml) | RSS | yes | 4 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Authentic Jobs](https://authenticjobs.com/?feed=job_feed&job_types=freelance%2Cfull-time%2Cinternship%2Cpart-time&search_location=remote&job_categories&search_keywords) | RSS | yes | 6 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Findjobit](https://findjobit.com/jobs/feed) | RSS | yes | 56 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Golang / Go Jobs](https://www.golangprojects.com/rss.xml) | RSS | yes | 15 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [FOSS Jobs](https://www.fossjobs.net/rss/all/) | RSS | yes | 10 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [I ❤ remote.io](https://iloveremote.io/rss/jobs/city/remote.rss) | RSS | yes | 21 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [HasJob](https://hasjob.co/feed) | RSS | yes | 14 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Landing.jobs](https://landing.jobs/feed?remote=true) | RSS | yes | 10 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [NODESK](https://nodesk.co/remote-jobs/index.xml) | RSS | yes | 10 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Lara Jobs](https://larajobs.com/feed) | RSS | yes | 9 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Python Jobs](https://www.python.org/jobs/feed/rss/) | RSS | yes | 20 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [WordPress Jobs](https://jobs.wordpress.net/feed/) | RSS | yes | 3 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Himalayas](https://himalayas.app/jobs/rss) | RSS | yes | 20 | worldwide | no | Credit/link Himalayas; daily sync; keep job links; no onward submission to third-party job aggregators. |
| [Jobicy](https://jobicy.com/jobs/feed) | RSS | yes | 200 | worldwide | no | Credit Jobicy; canonical job links; sync at most hourly; cache responses. |
| [Real Work From Anywhere](https://www.realworkfromanywhere.com/rss.xml) | RSS | yes | 127 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [elixirjobs](https://elixirjobs.net/rss) | RSS | yes | 10 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [cryptocurrencyjobs](https://cryptocurrencyjobs.co/index.xml) | RSS | yes | 55 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [cryptojobslist](https://api.cryptojobslist.com/jobs.rss) | RSS | yes | 100 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [germantechjobs](https://germantechjobs.de/rss) | RSS | yes | 562 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [swissdevjobs](https://swissdevjobs.ch/rss) | RSS | yes | 213 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [remotefirstjobs](https://remotefirstjobs.com/remote-jobs.rss) | RSS | yes | 100 | worldwide | no | Publisher expressly permits aggregators; preserve original links; feed is a rolling 100-item window. |
| [pyjobs](https://www.pyjobs.com/rss) | RSS | yes | 65 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Hot Nigerian Jobs](https://www.hotnigerianjobs.com/feed/rss.xml) | RSS | yes | 600 | Nigeria | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [MyJobMag Kenya](https://www.myjobmag.co.ke/jobsxml.xml) | RSS | yes | 100 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Service alerts may be redistributed under MyJobMag terms; expired posts can remain in feeds. |
| [MyJobMag Nigeria](https://www.myjobmag.com/jobsxml.xml) | RSS | yes | 100 | Nigeria | no | Service alerts may be redistributed under MyJobMag terms; expired posts can remain in feeds. |
| [Joblist Nigeria](https://joblistnigeria.com/feed) | RSS | yes | 20 | Nigeria | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Career Point Kenya](https://www.careerpointkenya.co.ke/feed/) | RSS | yes | 30 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [devopsjobs](https://devopsjobs.io/jobs.rss) | RSS | yes | 988 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Jobweb Kenya 2](https://jobwebkenya.com/feed/?post_type=job_listing) | RSS | yes | 10 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Warp Jobs](https://warpjobs.com/feed.xml) | RSS | yes | 80 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [RecruitHub Africa](https://recruithub.recruitmentroom.net/jobs.xml) | RSS | yes | 500 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [MyJobMag South Africa](https://www.myjobmag.co.za/jobsxml.xml) | RSS | yes | 100 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Service alerts may be redistributed under MyJobMag terms; expired posts can remain in feeds. |
| [Jobweb Ethiopia 2](https://jobwebethiopia.com/feed/?post_type=job_listing) | RSS | yes | 10 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Jobweb Uganda 2](https://jobwebuganda.com/feed/?post_type=job_listing) | RSS | yes | 10 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Jobs in Kenya](https://www.jobsinkenya.co.ke/wpjobboard/xml/rss/?filter=active) | RSS | yes | 50 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [iYouth South Africa](https://iyouth.co.za/rss/latest-posts) | RSS | yes | 50 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Top Job Seeker South Africa](https://topjobseeker.com/?feed=job_feed&job_types=contract%2Cfreelance%2Cfull-time%2Cinternship%2Cpart-time%2Cremote%2Ctemporary%2Cvolunteer&search_location=South+Africa&job_categories&search_keywords) | RSS | yes | 10 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Jobscanner](https://jobscanner.online/feed.xml) | RSS | yes | 100 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Hello Uganda](https://jobs.hellouganda.com/rss/all/) | RSS | yes | 5 | Africa | no | Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [YubHub Rust](https://feeds.yubhub.co/facet/skill/rust.rss) | RSS | yes | 100 | worldwide | no | Redistribution allowed with a visible Data by YubHub attribution link. |
| [JobsCollider](https://jobscollider.com/remote-jobs.rss) | RSS | yes | 100 | worldwide | no | Credit/link JobsCollider; keep supplied job URLs; no submission to third-party job aggregators. |
| [Alouadifa Morocco](https://alouadifa.ma/feed/) | RSS | yes | 10 | Africa | no | Morocco; French/Arabic jobs plus advice; title filter applied. Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [TensorHack AI jobs](https://tensorhack.com/data/jobs.rss) | RSS | yes | 3963 | worldwide | no | Feed lacks per-item publication timestamps; job RSS lacks location/details. Exports expressly provided for readers and personal tools; preserve source links; hourly cache; broad redistribution licence not established. |
| [Arbeitnow](https://www.arbeitnow.com/api/job-board-api) | API | yes | 325 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Himalayas API](https://himalayas.app/jobs/api?limit=20&offset=0) | API | yes | 20 | worldwide | no | Credit/link Himalayas; daily sync; keep job links; no onward submission to third-party job aggregators. |
| [Jobicy API](https://jobicy.com/api/v2/remote-jobs?count=20) | API | yes | 20 | worldwide | no | Credit Jobicy; canonical job links; sync at most hourly; cache responses. |
| [The Muse](https://www.themuse.com/api/public/jobs?page=0) | API | yes | 20 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Working Nomads](https://www.workingnomads.co/api/exposed_jobs/) | API | yes | 54 | worldwide | no | Reuse licence not established; keep original links; personal reader only until terms are checked. |

### 4. Needs a custom adapter

| Source | Endpoint | Auth | Key response fields | Reuse / adapter status |
|---|---|---|---|---|
| Arbeitnow | https://www.arbeitnow.com/api/job-board-api | No key on tested GET | data: slug, company_name, title, description, remote, url, tags, job_types, location, created_at | Reuse licence not established; keep original links; personal reader only until terms are checked. Implemented; first bounded page only. |
| Himalayas API | https://himalayas.app/jobs/api?limit=20&offset=0 | No key on tested GET | jobs: title, excerpt, companyName, companySlug, companyLogo, employmentType, minSalary, maxSalary, salaryPeriod, seniority, currency, locationRestrictions, timezoneRestrictions, categories, parentCategories, description, pubDate, expiryDate | Credit/link Himalayas; daily sync; keep job links; no onward submission to third-party job aggregators. Implemented; first bounded page only. |
| Jobicy API | https://jobicy.com/api/v2/remote-jobs?count=20 | No key on tested GET | jobs: id, url, jobSlug, jobTitle, companyName, companyLogo, jobIndustry, jobType, jobGeo, jobLevel, jobExcerpt, jobDescription, pubDate | Credit Jobicy; canonical job links; sync at most hourly; cache responses. Implemented; first bounded page only. |
| The Muse | https://www.themuse.com/api/public/jobs?page=0 | No key on tested GET | results: contents, name, type, publication_date, short_name, model_type, id, locations, categories, levels, tags, refs, company | Reuse licence not established; keep original links; personal reader only until terms are checked. Not installed; undocumented reuse terms. |
| Working Nomads | https://www.workingnomads.co/api/exposed_jobs/ | No key on tested GET | root array: url, title, description, company_name, category_name, tags, location, pub_date | Reuse licence not established; keep original links; personal reader only until terms are checked. Not installed; undocumented reuse terms. |

Himalayas and Jobicy RSS feeds are sufficient for the basic catalog. Their JSON adapters preserve company, country and expiry fields; avoid polling both forms for the same publisher. Arbeitnow, Himalayas and Jobicy adapters are implemented. Their adapter-specific config is in research/sources.adapters.json, separate from the exact-shape pasteable file above. The Muse and Working Nomads endpoints returned data without authentication, but an explicit redistribution licence was not established; they are not enabled. Pagination is described by links/meta (Arbeitnow), limit/offset (Himalayas) and page/page_count (The Muse).

### 5. Bonus: grants and hackathons

```json
[
  {
    "name": "NLnet",
    "type": "rss",
    "url": "https://nlnet.nl/feed.atom",
    "force_tags": [
      "grant"
    ],
    "include": [
      "funding",
      "call for",
      "grant"
    ]
  },
  {
    "name": "Ethereum Foundation",
    "type": "rss",
    "url": "https://blog.ethereum.org/en/feed.xml",
    "force_tags": [
      "grant"
    ],
    "include": [
      "grant",
      "funding"
    ]
  },
  {
    "name": "Opportunities for Africans 1",
    "type": "rss",
    "url": "https://www.opportunitiesforafricans.com/feed/",
    "include": [
      "hackathon",
      "grant",
      "computer",
      "engineering",
      "digital",
      "technology",
      "fellowship",
      "scholarship"
    ]
  },
  {
    "name": "Opportunity Desk",
    "type": "rss",
    "url": "https://opportunitydesk.org/feed/",
    "include": [
      "hackathon",
      "grant",
      "computer",
      "engineering",
      "digital",
      "technology",
      "fellowship",
      "scholarship"
    ]
  },
  {
    "name": "TensorHack grants and bounties",
    "type": "rss",
    "url": "https://tensorhack.com/data/opportunities.rss",
    "force_tags": [
      "grant"
    ]
  },
  {
    "name": "TensorHack hackathons",
    "type": "rss",
    "url": "https://tensorhack.com/data/hackathons.rss",
    "force_tags": [
      "hackathon"
    ]
  }
]
```

```text
https://nlnet.nl/feed.atom
https://blog.ethereum.org/en/feed.xml
https://www.opportunitiesforafricans.com/feed/
https://opportunitydesk.org/feed/
https://tensorhack.com/data/opportunities.rss
https://tensorhack.com/data/hackathons.rss
```

| Name | Type | Verified (yes/no) | Open roles (approx.) | Region (worldwide/Nigeria/Africa) | Key needed | Notes or restrictions |
|---|---|---|---:|---|---|---|
| [NLnet](https://nlnet.nl/feed.atom) | RSS | yes | 348 | worldwide | no | Announcement feed; includes awards/recaps or non-developer opportunities; check current application deadline. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Ethereum Foundation](https://blog.ethereum.org/en/feed.xml) | RSS | yes | 641 | worldwide | no | Announcement feed; includes awards/recaps or non-developer opportunities; check current application deadline. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Opportunities for Africans 1](https://www.opportunitiesforafricans.com/feed/) | RSS | yes | 10 | Africa | no | Announcement feed; includes awards/recaps or non-developer opportunities; check current application deadline. Country-specific or mixed regional listings; Nigeria access is not implied. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [Opportunity Desk](https://opportunitydesk.org/feed/) | RSS | yes | 10 | worldwide | no | Announcement feed; includes awards/recaps or non-developer opportunities; check current application deadline. Reuse licence not established; keep original links; personal reader only until terms are checked. |
| [TensorHack grants and bounties](https://tensorhack.com/data/opportunities.rss) | RSS | yes | 186 | worldwide | no | Announcement feed; includes awards/recaps or non-developer opportunities; check current application deadline. Feed lacks per-item publication timestamps; job RSS lacks location/details. Exports expressly provided for readers and personal tools; preserve source links; hourly cache; broad redistribution licence not established. |
| [TensorHack hackathons](https://tensorhack.com/data/hackathons.rss) | RSS | yes | 136 | worldwide | no | Announcement feed; includes awards/recaps or non-developer opportunities; check current application deadline. Feed lacks per-item publication timestamps; job RSS lacks location/details. Exports expressly provided for readers and personal tools; preserve source links; hourly cache; broad redistribution licence not established. |

Bonus custom adapter: https://devpost.com/api/hackathons returned 9 hackathons without an API key. Response: hackathons[] with id, title, displayed_location, open_state, thumbnail_url, analytics_identifier, url, time_left_to_submission, submission_period_dates, themes, prize_amount, prizes_counts, registrations_count, featured, organization_name, winners_announced, submission_gallery_url, start_a_submission_url; meta includes total_count/per_page. This endpoint is undocumented and reuse permission is unconfirmed, so it is not enabled. The verified XML feeds are handled by the installed grants/hackathon indexer. Funding announcements older than 180 days are skipped; awards and recaps are still leads, not proof of an open call.

**Unverified — excluded from imports**

| Name | Attempted endpoint | Result |
|---|---|---|
| hamsa | https://api.ashbyhq.com/posting-api/job-board/hamsa | No jobs in expected response array |
| cdpjobs | https://boards-api.greenhouse.io/v1/boards/cdpjobs/jobs | HTTP 404 |
| nexus | https://api.ashbyhq.com/posting-api/job-board/nexus | HTTP 404 |
| material | https://api.ashbyhq.com/posting-api/job-board/material | HTTP 404 |
| aztec | https://boards-api.greenhouse.io/v1/boards/aztec/jobs | HTTP 404 |
| alpenlabs | https://boards-api.greenhouse.io/v1/boards/alpenlabs/jobs | HTTP 404 |
| teleport | https://api.lever.co/v0/postings/teleport?mode=json | No jobs in expected response array |
| groq | https://boards-api.greenhouse.io/v1/boards/groq/jobs | HTTP 404 |
| mythic-ai | https://api.lever.co/v0/postings/mythic-ai?mode=json | HTTP 404 |
| roebling | https://api.ashbyhq.com/posting-api/job-board/roebling | HTTP 404 |
| iconicshift | https://api.ashbyhq.com/posting-api/job-board/iconicshift | No jobs in expected response array |
| paystack | https://boards-api.greenhouse.io/v1/boards/paystack/jobs | HTTP 404 |
| temporaltechnologies | https://boards-api.greenhouse.io/v1/boards/temporaltechnologies/jobs | HTTP 404 |
| temporal | https://boards-api.greenhouse.io/v1/boards/temporal/jobs | HTTP 404 |
| embed | https://boards-api.greenhouse.io/v1/boards/embed/jobs | HTTP 404 |
| buildwithfern | https://api.ashbyhq.com/posting-api/job-board/buildwithfern | HTTP 404 |
| Resolve | https://api.ashbyhq.com/posting-api/job-board/Resolve | HTTP 404 |
| happyrobot | https://api.ashbyhq.com/posting-api/job-board/happyrobot | HTTP 404 |
| wahed | https://api.lever.co/v0/postings/wahed?mode=json | HTTP 404 |
| Scale | https://api.ashbyhq.com/posting-api/job-board/Scale | HTTP 404 |
| truelogic | https://boards-api.greenhouse.io/v1/boards/truelogic/jobs | HTTP 404 |
| airbyte | https://boards-api.greenhouse.io/v1/boards/airbyte/jobs | HTTP 404 |
| Deel | https://api.ashbyhq.com/posting-api/job-board/Deel | No jobs in expected response array |
| recharge | https://boards-api.greenhouse.io/v1/boards/recharge/jobs | HTTP 404 |
| lifen | https://api.lever.co/v0/postings/lifen?mode=json | HTTP 404 |
| taplytics | https://api.lever.co/v0/postings/taplytics?mode=json | HTTP 404 |
| circonus | https://api.lever.co/v0/postings/circonus?mode=json | HTTP 404 |
| skillshare | https://api.lever.co/v0/postings/skillshare?mode=json | HTTP 404 |
| alan | https://api.lever.co/v0/postings/alan?mode=json | HTTP 404 |
| influxdb | https://boards-api.greenhouse.io/v1/boards/influxdb/jobs | HTTP 404 |
| iterative | https://api.lever.co/v0/postings/iterative?mode=json | HTTP 404 |
| Mycelium | https://api.lever.co/v0/postings/Mycelium?mode=json | HTTP 404 |
| impala | https://boards-api.greenhouse.io/v1/boards/impala/jobs | HTTP 404 |
| kraken | https://api.lever.co/v0/postings/kraken?mode=json | No jobs in expected response array |
| medium | https://api.lever.co/v0/postings/medium?mode=json | HTTP 404 |
| theoremonellc | https://api.lever.co/v0/postings/theoremonellc?mode=json | HTTP 404 |
| sketch | https://api.ashbyhq.com/posting-api/job-board/sketch | HTTP 404 |
| voxy | https://api.lever.co/v0/postings/voxy?mode=json | HTTP 404 |
| Crypto Jobs List | https://cryptojobslist.com/jobs.rss?jobLocation=Remote | HTTP 403 |
| Crunchboard Job Board | https://www.crunchboard.com/jobs.rss | HTTP 403 |
| Find Bacon | https://findbacon.com/rss/main | HTTP 404 |
| Drupal Jobs | https://jobs.drupal.org/filtered-jobs/%25/%25/%25/%25/%25/feed | Invalid XML |
| FreshRemote.work | https://freshremote.work/feed/ | fetch failed |
| Functional Jobs | https://functionaljobs.com/jobs/?format=rss | fetch failed |
| Golang Remote Jobs | https://golangjob.xyz/remote/jobs | HTTP 502 |
| Jobhunt.ai | https://jobhunt.ai/rss.xml | fetch failed |
| Jobspresso | https://jobspresso.co/feed/?post_type=job_listing | HTTP 403 |
| Krop | http://www.krop.com/services/feeds/rss/latest/ | HTTP 404 |
| Public Interest Tech | https://jobs.codeforamerica.org/job-postings.rss | fetch failed |
| Remote.co | https://remote.co/feed/?post_type=job_listing | HTTP 404 |
| Remotesome | https://www.remotesome.com/talent-signup | HTTP 404 |
| Virtual Vocations | https://www.virtualvocations.com/jobs/rss | HTTP 429 |
| Smashing Jobs (Freelance) | https://www.smashingmagazine.com/jobs/feed/ | No feed items |
| Vue Jobs | https://vuejobs.com/feed | HTTP 403 |
| Privacy-First Jobs | https://privacyfirstjobs.com/jobs/feed | fetch failed |
| WP Hired | http://www.wphired.com/jobs/feed/ | HTTP 522 |
| RunPod | https://boards-api.greenhouse.io/v1/boards/runpod/jobs | HTTP 404 |
| Fireworks AI | https://boards-api.greenhouse.io/v1/boards/fireworksai/jobs | HTTP 404 |
| Applied Intuition | https://boards-api.greenhouse.io/v1/boards/appliedintuition/jobs | HTTP 404 |
| Vast.ai | https://boards-api.greenhouse.io/v1/boards/vastai/jobs | HTTP 404 |
| Cerebras Systems | https://boards-api.greenhouse.io/v1/boards/cerebrassystems/jobs | HTTP 404 |
| Fal | https://boards-api.greenhouse.io/v1/boards/fal/jobs | HTTP 404 |
| Thinking Machines | https://boards-api.greenhouse.io/v1/boards/thinkingmachines/jobs | HTTP 404 |
| Black Forest Labs | https://boards-api.greenhouse.io/v1/boards/blackforestlabs/jobs | HTTP 404 |
| World Labs | https://boards-api.greenhouse.io/v1/boards/worldlabs/jobs | HTTP 404 |
| MatX | https://boards-api.greenhouse.io/v1/boards/matx/jobs | HTTP 404 |
| Parasail | https://boards-api.greenhouse.io/v1/boards/parasail/jobs | No jobs in expected response array |
| Mistral AI | https://api.lever.co/v0/postings/mistral?mode=json | No jobs in expected response array |
| Grants.gov 2 | https://www.grants.gov/rss/GG_OppModByCategory.xml | Invalid XML |
| Grants.gov 4 | https://www.grants.gov/rss/GG_NewOppByCategory.xml | Invalid XML |
| Grants.gov 3 | https://www.grants.gov/rss/GG_NewOppByAgency.xml | Invalid XML |
| Grants.gov 1 | https://www.grants.gov/custom/spoExit.jsp?p=rss/GG_OppModByAgency.xml | Invalid XML |
| Grants.gov 5 | https://www.grants.gov/rss/GG_OppModByAgency.xml | Invalid XML |
| WorkAnywhere | https://workanywhere.pro/rss.xml | HTTP 429 |
| Brabble hackathons | https://brabble.ai/rss/hackathons.xml | HTTP 403 in end-to-end run; intermittent access, omitted from imports |
| Jobgurus Nigeria | https://www.jobgurus.com.ng/jobs/feed | HTTP 403 |
| Job Instantly Nigeria | https://jobs.instantsdata.com.ng/rss/latest-posts | fetch failed |
| RiscZero | https://api.ashbyhq.com/posting-api/job-board/RiscZero | HTTP 404 |
| chainlink | https://api.lever.co/v0/postings/chainlink?mode=json | HTTP 404 |
| RemoteYeah Rust | https://remoteyeah.com/remote-rust-jobs.xml | Invalid XML |
| Career Nest | https://careernest.cloud/api/feed.xml | Invalid XML |
| ProGigFinder Africa | https://www.progigfinder.com/api/feed/jobs?category=technology | No feed items |
| Midi Madagascar recruitment | https://midi-madagasikara.mg/category/appel-doffres-avis-de-recrutement/feed/ | Invalid XML |
| HireWeb3 | https://hireweb3.io/job/rss | HTTP 403 |

**Working payloads omitted from imports**

Angular Jobs and NTEN returned news, rather than job postings. CareerHub returned a mixed advice/global feed. Jobweb Ethiopia’s general feed contained casino spam; only its job-listing feed is selected. MyJobMag Ghana returned job items but showed stale dates. Duplicate category/all-job feeds and feeds already in the checkout were not counted again. Other nonempty ATS boards without sufficient role/location evidence are kept in research/not-selected.json for review.

Directory lead: no relevant jobs/grants directory associated with the supplied @micheal_chomsky handle was verified, so no directory URL is included.
