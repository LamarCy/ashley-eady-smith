import { getCollection } from 'astro:content';
import { XMLParser } from 'fast-xml-parser';

// Ashley's channel, @ashleysmith_esq.
export const CHANNEL_ID = 'UCNWaQf6xlGaYAOry-ZCb9OA';
export const CHANNEL_URL = 'https://www.youtube.com/@ashleysmith_esq';
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

// Feed videos to keep off /speaking, matched by title (case-insensitive).
// Use this when the video id isn't known; otherwise add a clips/*.md with hidden: true.
const HIDDEN_TITLES = [/head,?\s*(and\s+)?not\s+the\s+tail/i];

export interface Clip {
  videoId: string;
  title: string;
  published?: Date;
  event?: string;
  year?: number;
  caption?: string;
  featured: boolean;
}

async function fetchFeed(): Promise<Clip[]> {
  try {
    const res = await fetch(FEED, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = new XMLParser().parse(await res.text());
    const entries = [].concat(xml?.feed?.entry ?? []) as any[];
    return entries.map((e) => ({
      videoId: String(e['yt:videoId']),
      title: String(e.title).replace(/\s+/g, ' ').trim(),
      published: new Date(e.published),
      featured: false,
    }));
  } catch (err) {
    console.warn(`[clips] YouTube feed fetch failed (${(err as Error).message}); using src/content/clips only.`);
    return [];
  }
}

let cached: Promise<Clip[]> | undefined;

/** Featured first (in file order), then newest first. Hidden clips removed. */
export function getClips(): Promise<Clip[]> {
  cached ??= (async () => {
    const [feed, entries] = await Promise.all([fetchFeed(), getCollection('clips')]);
    const overrides = new Map(entries.map((e) => [e.data.videoId, e.data]));
    const byId = new Map(feed.map((c) => [c.videoId, c]));
    for (const o of overrides.values()) {
      if (!byId.has(o.videoId)) byId.set(o.videoId, { videoId: o.videoId, title: o.title ?? 'Untitled', featured: false });
    }
    const clips: Clip[] = [];
    for (const c of byId.values()) {
      const o = overrides.get(c.videoId);
      if (o?.hidden) continue;
      if (HIDDEN_TITLES.some((re) => re.test(c.title))) continue;
      clips.push({
        ...c,
        title: o?.title ?? c.title,
        event: o?.event,
        year: o?.year ?? c.published?.getFullYear(),
        caption: o?.caption,
        featured: o?.featured ?? false,
      });
    }
    const time = (c: Clip) => c.published?.getTime() ?? (c.year ? new Date(c.year, 0).getTime() : 0);
    return clips.sort((a, b) => Number(b.featured) - Number(a.featured) || time(b) - time(a));
  })();
  return cached;
}
