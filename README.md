# ashleyeadysmith.com

Ashley Eady Smith: speaker, encourager, artist and singer. Astro 5 static site on Netlify.

Every change is one small file. Edit it on GitHub (phone or laptop), commit to `main`, and Netlify rebuilds the site in about a minute.

## Add a speech clip

Clips from Ashley's YouTube channel ([@ashleysmith_esq](https://www.youtube.com/@ashleysmith_esq)) appear on /speaking automatically at each build, newest first. To feature, rename or hide one, add a file in `src/content/clips/`:

```md
---
videoId: xOm4PqmNIfs        # the part after watch?v=
title: "Spacesuits, The Speech"
event: "Name of the event"
year: 2024
caption: "One line about the talk."
featured: true               # featured clips go first; the top one plays on Home
hidden: false                # true removes it from the site
---
```

New uploads to the channel show up on the next build. To pull them in without a code change, trigger a deploy in Netlify (Deploys → Trigger deploy).

## Add an artwork

1. Put the photo in `src/assets/art/` (JPG or PNG, any size; it's resized to WebP automatically).
2. Add `src/content/art/my-piece.md`:

```md
---
title: "Morning Field"
year: 2026
medium: "Oil on canvas"
dimensions: "24 × 30 in"
image: ../../assets/art/morning-field.jpg
alt: "Yellow and green brushstrokes suggesting a field at sunrise"
available: true      # shows an "Ask about this piece" note
order: 1             # lower numbers first
---
```

Delete the `placeholder-*.md` files once real work is in.

## Add a track

Put an MP3 in `public/audio/` or use a YouTube video, then add `src/content/music/my-song.md`:

```md
---
title: "My Song"
year: 2026
credits: "Folk · written by … · vocals Ashley Eady Smith · 2026"
youtubeId: abc123XYZ         # or:
audio: /audio/my-song.mp3
buyUrl: https://…            # optional, shows an "Own it" note
order: 3
---
```

## Change a price or offer

Edit `src/content/offers/pop.md`, `encouragement-sessions.md` or `retreats.md`. `price` is shown as written ("$12", "60 min", "Inquire"). Paste each Stripe Payment Link into `cta_url` in place of `https://buy.stripe.com/PLACEHOLDER`.

## Swap a photo

- **Portrait:** save it as `src/assets/portrait.jpg`. It replaces the yellow placeholder on Home and About.
- **Hero sky:** replace `src/assets/sky.jpg`, then run `npm run brand` to refresh the share image (`public/og.jpg`).

## Edit words

Page copy lives in `src/pages/*.astro`. Search for `ASHLEY TO REVIEW` to find every placeholder.

## Replay the opening

The signature opening plays once per visit. To show it to someone again, open **https://ashleyeadysmith.com/?intro**; it plays on every load of that link.

## Contact form

Netlify Forms handles `/contact` (no backend). Submissions appear in Netlify → Forms → contact. Turn on email notifications there.

## Run it locally

```bash
npm install
npm run dev
```

`npm run build` writes the site to `dist/`.

## How Netlify deploys

`netlify.toml` sets the build command `npm run build` and publish directory `dist`. The Netlify site `ashley-eady-smith` is connected to this repo: every push to `main` deploys, and pull requests get preview URLs. The domain ashleyeadysmith.com is registered at Namecheap with DNS pointing at Netlify (`A @ 75.2.60.5`, `CNAME www → ashley-eady-smith.netlify.app`); HTTPS is Netlify's Let's Encrypt certificate and renews automatically.
