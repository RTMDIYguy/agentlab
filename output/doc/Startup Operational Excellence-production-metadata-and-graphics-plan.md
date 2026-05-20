# Startup Operational Excellence - Production Metadata And Graphics Plan

Date: 2026-05-20
Status: Draft production control sheet

## Purpose

This sheet keeps the production details consistent across DOCX, PDF, Calibre,
cover assets, graphics, and Amazon KDP. It exists to prevent the final upload
stage from becoming a cycle of upload, preview, adjust, and re-upload.

## Working Metadata

| Field | Current Value | Notes |
| --- | --- | --- |
| Title | Startup Operational Excellence | Must match manuscript, cover, Calibre, PDF metadata, and KDP title setup. |
| Subtitle | A Practical Mentor Guide for Building a Business with its Own Soul | Robert-approved 2026-05-20; must match cover design. |
| Author | Robert T. McCarthy | Must match cover and KDP contributor field. |
| Publisher / Imprint | Uncle Robert Consulting LLC | Working assumption. |
| Language | English | Must match KDP setup and cover language. |
| Edition | Draft review edition | Remove or revise before publication. |
| Primary format | Kindle eBook | First production target. |
| Secondary format | Paperback | Prepare after manuscript and page count stabilize. |
| Working paperback trim | 8.5 x 11 inches | Matched to `The Bootstrappers Guide to the World` shipped PDF/DOCX checked locally on 2026-05-20. |
| Print margins | 0.75 in top/bottom; 0.5 in left/right | Matched to shipped Bootstrapper DOCX. Recheck before final paperback export. |
| Series | None | Stand-alone book. Do not list as an Ownable OS or Bootstrapper series title. |
| Categories | Business Startup; Bootstrapping | Confirmed from shipped Bootstrapper Calibre OPF subjects. Map to closest KDP categories during setup. |
| Keywords | business startup; bootstrapping; startup operational excellence; SOE; StartupOperationalExcellence; small business systems; founder operations; operational excellence; Ownable | Local Bootstrapper files did not expose a separate KDP keyword list; use confirmed subjects plus Robert's requested additions and spacing/no-spacing variants where fields allow. |
| Marketing hashtags | #SOE; #StartupOperationalExcellence; #Ownable | Use in social, launch, and campaign copy where hashtags are appropriate; omit the hash marks inside KDP keyword fields unless the platform specifically supports them. |
| Description / blurb | Drafted in `production-calibre-handoff-2026-05-20\README-Calibre-Handoff.md` | Review and tune before KDP detail-page entry. |

## Positioning Note

Robert confirmed on 2026-05-20 that this is a stand-alone book. It predates
his reading of `Ownable OS`; its fit as a prequel should be treated as organic
and providential, not as a planned series relationship or derivative claim.

## Required Disclosures

Use the same disclosure language in the manuscript front matter and production
handoff packet.

Composite character disclosure:

> The founder scenes in this book use Sam as a composite character. They are
> designed to teach practical lessons without exposing private client details.

AI-assisted writing disclosure:

> This book was developed with AI-assisted drafting and editing under Robert
> McCarthy's direction. The ideas, judgment, voice, final editorial decisions,
> and responsibility for the work remain with the author.

AI-assisted graphics disclosure:

> Some graphics or visual aids in this book may be AI-assisted. They are used
> to clarify concepts, not to represent real clients, private business records,
> or documented case results unless explicitly stated.

## KDP Cover Notes

Current KDP guidance reviewed on 2026-05-20 says Kindle eBooks need a separate
marketing cover image for the Amazon detail page. KDP recommends 2,560 px high
by 1,600 px wide, at least 300 DPI/PPI, 5 MB or fewer, JPEG preferred, and RGB
color profile for Kindle eBook covers.

KDP also says Kindle eBooks need an internal content cover image, and warns not
to create duplicate cover pages in the content. Before final export, confirm
the Calibre/EPUB cover handling so the cover appears once and the metadata
points to the correct cover image.

Current cover background candidate added 2026-05-20:

- Source graphic: `graphics/startup-operational-excellence/SOE Cover Graphic.png`
- Preferred cropped candidate: `graphics/startup-operational-excellence/SOE Cover Graphic - cropped no strip 1600x2000.jpg`
- Calibre handoff copy: `production-calibre-handoff-2026-05-20/cover-assets/SOE Cover Graphic - cropped no strip 1600x2000.jpg`
- Dimensions: 1600 x 2000 px
- Notes: image is under 5 MB and RGB; it is a 4:5 portrait ratio rather than KDP's recommended 1600 x 2560. Use as a current cover background candidate, preferably in Canva/Calibre with real title/subtitle/author text overlaid. The original generated image included a fake bottom title strip; the preferred candidate crops the strip out without blur patching. The notebook page still contains faux handwritten marks typical of AI-generated images.

For paperback, KDP requires the cover as a single PDF containing back cover,
spine, and front cover. The final print cover depends on final trim, paper
type, and page count. KDP notes that cover text must match the title setup
details and that spine text requires at least 79 pages.

## Interior Graphics Standard

Use graphics only when they teach, summarize, or clarify.

Preferred first-edition graphic style:

- simple line diagrams
- grayscale-safe tables or process maps
- readable at small ebook sizes
- no fine text inside images unless preview confirms legibility
- no fake client data
- no private business records
- no unlicensed stock assets

KDP's reflowable image guidance says pictorial images should be clear enough
not to distract and recommends pictorial images occupy at least 60% screen
width. For images with text such as graphs, technical diagrams, or maps, KDP
recommends at least 80% screen width so the text remains readable.

## Proposed Graphics Inventory

| ID | Working Title | Placement | Type | Purpose | Source / Status | Alt Text Draft |
| --- | --- | --- | --- | --- | --- | --- |
| G-01 | The Customer Request Path | Chapter 1 | Flow diagram | Shows how one customer request moves from first contact to follow-up. | Created and inserted: `graphics/startup-operational-excellence/SOE-G01-customer-request-path.png` | A simple flow diagram showing a customer request moving from intake through proposal, delivery, invoice, follow-up, and proof capture. |
| G-02 | Value Or Motion Filter | Chapter 2 | Decision diagram | Helps readers decide whether a step serves the customer, protects work, reduces risk, or prepares the next person to act. | Created and inserted: `graphics/startup-operational-excellence/SOE-G02-value-or-motion-filter.png` | A decision diagram for sorting workflow steps into value, protection, risk reduction, handoff preparation, or unnecessary motion. |
| G-03 | Capacity Scorecard | Chapter 3 | Table / scorecard | Turns priorities into a capacity and opportunity score. | Created and inserted: `graphics/startup-operational-excellence/SOE-G03-capacity-scorecard.png` | A scorecard table comparing revenue potential, customer value, strategic fit, delivery capacity, cash impact, and learning value. |
| G-04 | Bootstrap Limit Wall | Chapter 4 | Signpost diagram | Shows motion, signal, constraint, manual bridge, and funding trigger. | Created and inserted: `graphics/startup-operational-excellence/SOE-G04-bootstrap-limit-wall.png` | A five-step signpost diagram showing how founders move from motion to signal, then identify constraints, manual bridges, and funding triggers. |
| G-05 | Learning Loop | Chapter 5 | Loop diagram | Shows problem, root cause, system update, review, and new standard. | Created and inserted: `graphics/startup-operational-excellence/SOE-G05-learning-loop.png` | A circular learning loop moving from problem to root cause, system update, review, and standard. |
| G-06 | Weekly Operating Rhythm | Chapter 6 | Weekly grid | Shows Monday through Friday cadence. | Created and inserted: `graphics/startup-operational-excellence/SOE-G06-weekly-operating-rhythm.png` | A weekly rhythm showing Monday pipeline, Tuesday content, Wednesday community, Thursday delivery, and Friday cash and learning. |
| G-07 | Ownable Business Dashboard | Chapter 7 | Dashboard sketch | Shows offer, customer path, money, proof, risk, and rhythm. | Created and inserted: `graphics/startup-operational-excellence/SOE-G07-ownable-business-dashboard.png` | A dashboard sketch showing the core views needed to make a business legible and trustworthy. |
| G-08 | Stewardship Review | Chapter 8 | Checklist graphic | Summarizes the founder's stewardship questions. | Created and inserted: `graphics/startup-operational-excellence/SOE-G08-stewardship-review.png` | A short checklist for reviewing what the founder still carries, what the business should carry, and what promise needs clearer support. |

Project graphics inventory files:

- `graphics/startup-operational-excellence/graphics-inventory.md`
- `graphics/startup-operational-excellence/graphics-inventory.csv`
- `graphics/startup-operational-excellence/SOE-graphics-contact-sheet.png`

## Production Packet Checklist

Before KDP upload, create a clean production folder with:

- final DOCX source
- final PDF review copy
- signed-review DOCX/PDF copy for human feedback, if used
- Calibre source or EPUB export
- cover image for Kindle eBook
- paperback cover PDF if print is included
- graphics folder
- graphics inventory with file name, placement, caption, alt text, source, and
  AI-assisted status
- metadata sheet
- disclosure text
- KDP checklist
- export notes

Current signed review copy:

- `production-calibre-handoff-2026-05-20/Startup Operational Excellence - signed review copy.docx`
- `production-calibre-handoff-2026-05-20/Startup Operational Excellence - signed review copy.pdf`
- Cover wording uses rich orange title and author text in honor of Kayla.
- Purpose: shareable human-feedback copy before final KDP upload.

## Source Notes

Current production notes were checked against Amazon KDP help pages on
2026-05-20:

- KDP Cover Image Guidelines:
  `https://kdp.amazon.com/en_US/help/topic/G6GTK3T3NUHKLEFX`
- KDP Image Guidelines - Reflowable:
  `https://kdp.amazon.com/help/topic/G75V4YX5X8GRGXWV`
- KDP Create a Paperback Cover:
  `https://kdp.amazon.com/en_US/help/topic/G201953020`
- KDP Prepare Your Cover:
  `https://kdp.amazon.com/en_US/help/topic/G202187820`
