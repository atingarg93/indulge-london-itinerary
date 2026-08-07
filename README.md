# London · Mr & Mrs Kalra · September 2026

An interactive itinerary website for a four day luxury trip to London, 10 to 13 September 2026,
prepared as a private client deliverable in the style of Indulge Global.

Plain HTML, CSS and JavaScript. No build step, no dependencies to install, no framework.

## Running it locally

Any static file server will do. The simplest option:

```bash
python3 scripts/serve.py
```

Then open http://127.0.0.1:4321

Opening `index.html` directly from the file system mostly works, but the photograph credits in the
footer are loaded with `fetch`, which browsers block on `file://`. Use the server instead.

## Deploying to Vercel

1. Create an empty repository on GitHub.
2. From this folder:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

3. Go to vercel.com, choose **Add New → Project**, and import the repository.
4. Leave every build setting untouched. Framework preset **Other**, no build command, output
   directory the repository root. Press **Deploy**.

Vercel serves the folder as it is. Every later `git push` redeploys automatically.

## How it is put together

```
index.html            every section of the page
css/style.css         the whole stylesheet
js/itinerary.js       all itinerary content, the single source of truth
js/app.js             rendering and interactions
assets/img/           19 photographs, webp, two sizes each
assets/img/credits.json  photograph attribution, rendered into the footer
wireframe/            the approved wireframe, kept for reference
scripts/serve.py      local preview server
```

### Editing the itinerary

Everything a guest reads on the day pages, in the master timetable, on the map and in the contact
directory comes from **`js/itinerary.js`**. Change a time, a price or a description once in that file
and every part of the page updates together. No other file needs touching.

Each event in a day is one of three kinds:

- `venue` gets a photograph, an address, links to the website and to Google Maps, a telephone
  number, a reserved marker and an optional detail panel
- `travel` renders as a single quiet grey line with a hollow marker, and never carries a photograph
- `pause` is the same treatment, used for breakfasts, formalities and checkout

### Design

Colours and typefaces are taken from indulge.global: ink `#121212`, gold `#D29C33`,
cream `#E8DDC6`, off white `#EFEEEC`, with Noto Serif Display, Inter Tight and Fragment Mono.
Green `#3B5346` is the one addition and it appears only to mark something already reserved or
already included in the room rate.

### Photographs

Nineteen images, none repeated. Landmark photography comes from Wikimedia Commons under Creative
Commons licences with the photographer named in the footer. Hotel, restaurant and experience images
come from each venue's own website and are credited to the venue. Nothing illustrates a flight
transfer, a taxi, airport formalities or a checkout, so movement between places never competes with
the places themselves.

### Accessibility and performance

Keyboard reachable throughout with visible focus rings, `prefers-reduced-motion` respected,
tap targets at least 44px, alt text on every photograph, and a print stylesheet so the page produces
a clean PDF from the browser. Images are webp at two widths with `srcset`, lazy loaded below the
fold. The only external dependencies are Google Fonts and Leaflet for the map, both from a CDN.
