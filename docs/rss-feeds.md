# RSS feeds

TradingPost proxies York Factory's public RSS feeds:

| Public URL | York Factory API |
| --- | --- |
| /feeds/all.xml | /api/v1/feeds/all.xml |
| /feeds/memos.xml | /api/v1/feeds/memos.xml |
| /feeds/posts.xml | /api/v1/feeds/posts.xml |
| /feeds/polls.xml | /api/v1/feeds/polls.xml |

The root layout includes the three public RSS alternate links in the document head, so
discovery survives pages that override canonical URL metadata.

Feeds include the latest 50 published entries with excerpts and article links.
Drafts, scheduled publications and hidden posts are excluded by York Factory.
The proxy never forwards user credentials or preview parameters. Responses have
a 60-second public cache lifetime; upstream failures return a generic error.

Set YORK_FACTORY_API_URL as for the other API routes. Deploy the backend first.
Run npm run test:feeds to check the proxy's public access boundary and errors.

Polls are temporarily admin-only on TradingPost. The all.xml proxy requests exclude=polls from York Factory; polls.xml requires a live admin session and uses private, no-store caching. It is not advertised publicly. York Factory’s own feeds remain public.
