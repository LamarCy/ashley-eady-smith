import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Speech clips. The YouTube feed is the source of truth at build time; a file
// here overrides a feed entry by videoId (title, event, year), hides it, or
// marks it featured. Clips that are not in the feed are added as-is.
const clips = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clips' }),
  schema: z.object({
    videoId: z.string(),
    title: z.string().optional(),
    event: z.string().optional(),
    year: z.number().optional(),
    caption: z.string().optional(),
    featured: z.boolean().default(false),
    hidden: z.boolean().default(false),
  }),
});

// Drawings and paintings. Leave `image` out to show a Naples Yellow placeholder.
const art = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/art' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.number(),
      medium: z.string(),
      dimensions: z.string(),
      image: image().optional(),
      alt: z.string().optional(),
      available: z.boolean().default(false),
      order: z.number().default(0),
    }),
});

// Original music. A row plays youtubeId if set, otherwise the MP3 at `audio`
// (a path under public/, e.g. /audio/momma-gone.mp3).
const music = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/music' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.number(),
      credits: z.string(),
      youtubeId: z.string().optional(),
      audio: z.string().optional(),
      cover: image().optional(),
      buyUrl: z.string().url().optional(),
      order: z.number().default(0),
    }),
});

// The three offers. Prices are display strings so "$12" or "60 min" both work.
// `image` (optional) is a cover or product photo shown beside the offer on /shop.
const offers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/offers' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    tagline: z.string(),
    price: z.string(),
    format: z.string(),
    cta_label: z.string(),
    cta_url: z.string(),
    kind: z.enum(['product', 'session', 'retreat']),
    image: image().optional(),   // product photo / cover, shown on /shop
    image_alt: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { clips, art, music, offers };
