import { createHash } from "node:crypto";
import type { RawSignalItem, SocialAdeptConfig } from "./types.js";

function computeHash(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export class SignalCollector {
  private config: SocialAdeptConfig;

  constructor(config: SocialAdeptConfig) {
    this.config = config;
  }

  private isExcluded(text: string): boolean {
    const excludes = this.config.filters?.excludeKeywords ?? [];
    const lower = text.toLowerCase();
    return excludes.some((kw) => lower.includes(kw.toLowerCase()));
  }

  public async fetchReddit(): Promise<RawSignalItem[]> {
    const reddit = this.config.reddit;
    if (!reddit?.enabled) return [];

    const items: RawSignalItem[] = [];
    const headers = {
      "User-Agent": "AgentLab-SocialAdept/1.0.0 (Research Signal Scanner)",
    };

    for (const sub of reddit.subreddits) {
      for (const query of reddit.queries) {
        try {
          const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=${reddit.limit || 5}&restrict_sr=1`;
          const res = await fetch(url, { headers });
          if (!res.ok) {
            continue;
          }

          const data = (await res.json()) as any;
          const posts = data?.data?.children || [];

          for (const post of posts) {
            const d = post.data;
            if (!d || d.over_18 || d.is_self === false && !d.selftext) continue;

            const title = cleanText(d.title);
            const body = cleanText(d.selftext);
            const fullContent = `${title} ${body}`;

            if (this.isExcluded(fullContent)) continue;
            if (fullContent.length < 20) continue;

            const itemUrl = d.permalink
              ? `https://reddit.com${d.permalink}`
              : d.url;
            const hash = computeHash(`reddit:${d.id}:${title}`);

            items.push({
              id: `reddit_${d.id}`,
              source: "reddit",
              sourceId: d.id,
              title,
              body: body.slice(0, 1500),
              author: d.author || "anonymous",
              url: itemUrl,
              createdAt: new Date(d.created_utc * 1000).toISOString(),
              query: `r/${sub}: ${query}`,
              hash,
            });
          }
        } catch (err) {
          // Graceful handling of network or rate limit issues
          console.warn(`[SocialAdept] Reddit fetch warning for r/${sub} (${query}):`, (err as Error).message);
        }
      }
    }

    return items;
  }

  public async fetchHackerNews(): Promise<RawSignalItem[]> {
    const hn = this.config.hackerNews;
    if (!hn?.enabled) return [];

    const items: RawSignalItem[] = [];

    for (const query of hn.queries) {
      try {
        const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=(story,comment)&hitsPerPage=${hn.limit || 5}`;
        const res = await fetch(url);
        if (!res.ok) continue;

        const data = (await res.json()) as any;
        const hits = data?.hits || [];

        for (const hit of hits) {
          const title = cleanText(hit.title || hit.story_title || hit.comment_text?.slice(0, 80));
          const body = cleanText(hit.story_text || hit.comment_text || "");
          const fullContent = `${title} ${body}`;

          if (this.isExcluded(fullContent)) continue;
          if (fullContent.length < 20) continue;

          const itemUrl = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
          const hash = computeHash(`hn:${hit.objectID}:${title}`);

          items.push({
            id: `hn_${hit.objectID}`,
            source: "hacker_news",
            sourceId: hit.objectID,
            title: title.slice(0, 200),
            body: body.slice(0, 1500),
            author: hit.author || "anonymous",
            url: itemUrl,
            createdAt: hit.created_at || new Date().toISOString(),
            query: `HN: ${query}`,
            hash,
          });
        }
      } catch (err) {
        console.warn(`[SocialAdept] HN fetch warning for ${query}:`, (err as Error).message);
      }
    }

    return items;
  }

  public async collectAll(): Promise<RawSignalItem[]> {
    const [redditItems, hnItems] = await Promise.all([
      this.fetchReddit(),
      this.fetchHackerNews(),
    ]);

    const all = [...redditItems, ...hnItems];
    
    // Deduplicate by item ID & hash
    const seen = new Set<string>();
    const deduplicated: RawSignalItem[] = [];

    for (const item of all) {
      if (!seen.has(item.hash) && !seen.has(item.id)) {
        seen.add(item.hash);
        seen.add(item.id);
        deduplicated.push(item);
      }
    }

    return deduplicated;
  }
}
