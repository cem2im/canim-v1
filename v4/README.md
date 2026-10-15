# Canım v4 (yeni)

A single page. No server, no account, nothing is stored. Design: `cem2im/cem2im` → `design/canim-mockup.html` (v9).

- **Child's side** (`#/`): Kimin için → (sex) → age band → daily-medicine illness → list. Each item has "Annene sor" (a ready WhatsApp message), and the list can be sent to the parent, shown to the doctor, or saved as an image.
- **Parent's side** (`#/a?y=60&c=K&k=anne&n=Elif`): the link carries only the age band, sex, who it is for and an optional first name. **No illness information goes in the link**; the parent answers that question herself. On first open, "Önce dinleyin" is highlighted and the rest of the page is dimmed until any tap.
- **Doctor page** (`?d=1`), **for physicians** (`#/kaynak`): the rule table and its sources.
- The spotlight dims later steps to 75% but never locks them. Answered questions, buttons and safety text are never dimmed.

## Commands

```
npm run dev:yeni     # development
npm run build:yeni   # → docs/yeni  (canim.uzunyasa.com/yeni/ once merged to master)
```

The existing v3 app (`/app/`) and the landing page are untouched.

## Before launch (open items)

1. **Physician review of the clinical rules:** `src/rules.js` (each item has a source) and `#/kaynak`. Once approved, set `REVIEWED = true`; the "Deneme sürümü" strip then disappears.
2. **Physician review of the "Annene sor" messages:** `src/messages.js`.
3. Points to verify:
   - the free pneumococcal vaccine for under-65 risk groups;
   - whether a "start at 70" note is needed for the GGK upper age limit (70);
   - whether to keep the DXA item (not part of the national programme; from USPSTF/TEMD).
4. **Narration:** currently it uses the phone's own Turkish voice (`speechSynthesis`). Replace it with a recording once the voice decision is made.
5. A short KVKK check (nothing is stored; the link carries no health data).
6. Testing with 5–10 users aged 60+.
