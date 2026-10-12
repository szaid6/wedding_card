<img src="assets/icon.svg" width="64" height="64" alt="">

# zaid wedding card

Animated digital wedding invitations for an Indian Muslim wedding, traditional with a modern finish: carved palace doors that swing open, Bismillah calligraphy, an illustrated bride and groom under a Mughal arch, hanging lanterns, falling rose petals, and ivory arched cards on an emerald and gold Islamic pattern. Each JSON file in `data/invitations/` becomes its own page at
`/invite/<file-name>`.

Built with Next.js (App Router), Tailwind CSS v4, `motion` and `lucide-react`.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```

`/` lists every invitation; `/invite/zaid-aisha` is the full English/Arabic demo and `/invite/sample-minimal`
shows how sections disappear when you leave them out.

## Make a new invitation

1. Copy `data/invitations/zaid-aisha.json` to `data/invitations/<slug>.json` (lowercase letters, digits
   and dashes; the slug is the URL).
2. Edit the details. Delete any section you don't want.
3. Put the couple's photos in `public/images/` and list them under `slideshow`.

Files starting with `_` are ignored, so `_draft.json` won't be published. If a file is broken, the page
error tells you which field is wrong.

### Fields

| Field | Required | Notes |
| --- | --- | --- |
| `template` | yes | `"noor"` |
| `couple.groom` / `couple.bride` | yes | `{ "name": "Zaid", "details": "Son of ...\nB.E." }`. `\n` starts a new line. The details appear in the "Bride & Groom" card. |
| `couple.brideFirst` | | `true` puts the bride's name first. |
| `event.date` / `event.time` / `event.timezone` | yes | `"2027-01-31"`, `"10:30"` (24h), `"Asia/Kolkata"`. Drives the scratch card, countdown and calendar links. |
| `event.title`, `event.durationHours` | | Used for "Save the Date" calendar entries (default 4 hours). |
| `bismillah` | | `false` hides the Bismillah above the couple (shown by default). |
| `headline` | | Line above the names, e.g. "We're getting married". |
| `verse` | | `{ "arabic", "translation"?, "reference"? }`: a Quran verse above the welcome message. The Arabic shows in both languages, the translation only in English. |
| `welcomeMessage` | | First section after the hero. |
| `scratchCard` | | `{ "title", "revealLabel" }`, or `false` to show a plain date instead. |
| `slideshow` | | Array of image paths/URLs. |
| `countdown` | | `{ "title" }`, or `false` to hide. |
| `program` | | `{ "title", "items": [{ "id", "name", "dateTime": "2027-01-31T10:00", "description" }] }`. Every event (Mehendi, Nikah, Reception, ...) goes here; grouped by day automatically. |
| `guestGroups` | | Which events each guest link shows. See below. |
| `venue` | | `{ "name", "address", "mapsUrl"?, "mapQuery"? }`. The map embed and button are built from name + address unless you override them. |
| `gifts` | | A string, or `{ "title", "text" }`. |
| `closing` | | `{ "message", "signature" }` |
| `music` | | `{ "enabled": false }` to turn music off, or `{ "src": "/my-song.mp3" }` to change it. |
| `seo` | | `{ "title", "description" }` for the browser tab and link previews. |
| `ar` | | Arabic text; adds the English/Arabic toggle. See below. |
| `defaultLanguage` | | `"en"` (default) or `"ar"`: the language the page opens in. |

### Arabic

Add an `ar` block with the same shape as the rest of the file, containing only the text in Arabic.
The page then shows an "العربية" / "English" button, and in Arabic it switches to right-to-left with
Arabic fonts: Aref Ruqaa (calligraphy) for names and headings, Amiri for everything else. Dates, times
and the countdown use Arabic month names and digits (٣١ يناير ٢٠٢٧).

```json
"ar": {
  "couple": { "groom": { "name": "زيد" }, "bride": { "name": "عائشة" } },
  "headline": "نحتفل بزفافنا",
  "program": { "items": [{ "name": "استقبال الضيوف" }, { "name": "عقد القران" }] },
  "venue": { "name": "تاج لاندز إند" }
}
```

- Anything you leave out falls back to the English text. Section headings ("برنامج الحفل", "المكان",
  ...) are built in; set a `title` inside `ar` only to override one.
- Program items are matched by position, and dates and times always come
  from the English list.
- The map always searches the English venue name and address.
- Link straight to a language with `?lang=ar` or `?lang=en`, e.g. `/invite/zaid-aisha?lang=ar`.

### Guest links

Not everyone is invited to every event. Give each program item an `id` and list who sees what:

```json
"program": {
  "items": [
    { "id": "mehendi", "name": "Mehendi", "dateTime": "2027-01-28T20:30" },
    { "id": "nikah", "name": "Nikah Ceremony", "dateTime": "2027-01-31T10:30" },
    { "id": "reception", "name": "Reception", "dateTime": "2027-02-02T19:30" }
  ]
},
"guestGroups": {
  "family": ["mehendi", "nikah", "reception"],
  "reception": ["reception"]
}
```

Then send each guest their group's link:

- `/invite/zaid-aisha?for=family` shows all three events.
- `/invite/zaid-aisha?for=reception` shows only the Reception.
- `/invite/zaid-aisha` with no `?for=` (or an unknown group) shows everything.

The scratch card, countdown and "Save the Date" follow the guest's events: they use `event.date`/`event.time`
when the guest is invited to something on that day, and otherwise the guest's first event. Group names
appear in the link, so pick neutral ones. Combine with the language: `?for=reception&lang=ar`.

## How it's put together

- `src/app/invite/[slug]/page.tsx` loads the JSON (`src/lib/load-invitations.ts`) and prerenders one
  static page per file.
- `src/components/invitation/InvitationView.tsx` lays out the sections in order and owns music and
  the scroll lock.
- `IntroHero.tsx`: closed jaali palace doors with a gold medallion of the couple's initials. A tap starts the
  music and swings the doors open onto the Bismillah, the couple illustration and their names, then the page
  unlocks for scrolling.
- `Decor.tsx`: the hand-drawn SVG pieces (the bride and groom, Mughal arch, lanterns, medallion, crescent,
  eight-point star, jasmine-and-rose garland, Mughal skyline, falling rose petals).
- `src/lib/i18n.ts` has the built-in English/Arabic labels and merges the `ar` block over the English
  content. Fonts switch through CSS variables under `[lang="ar"]` in `globals.css`.
- `src/lib/templates.ts` holds each template's colors (including `gold`, `emerald` and `maroon`) and music.
  Colors are CSS variables mapped to Tailwind tokens (`text-primary`, `bg-emerald`, ...)
  in `src/app/globals.css`, so a new template is a new entry there plus its assets in `public/templates/<id>/`.

## Assets

All artwork is drawn in code (SVG and CSS), so there are no background images to license.
`public/templates/noor/music.mp3` is still the stand-in track from zareqia.com's "Royal Grace" template:
replace it with music you have the rights to before publishing these invitations anywhere public.
