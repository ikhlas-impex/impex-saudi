# IMPEX Web App — Automatic Language Detection (English/Arabic)

Goal: when a dealer taps a link from the **Arabic** branch of the Interakt
bot, the web app (`impex-saudi.vercel.app`) should open already in Arabic —
no manual toggle needed. When there's no explicit signal, the app should
still make a smart guess instead of defaulting blindly to English.

This assumes **Next.js Pages Router** (based on your `/api/pickup/create.js`
path). If your app is actually plain React/Vite or the App Router, the
concepts are identical but the file names/APIs below will need adjusting —
just flag it and I'll redo the snippets.

---

## The three-layer detection order

Check these in priority order, first match wins:

1. **`lang` query param on the URL** — set explicitly by the Interakt bot.
   Most reliable, because it reflects the exact choice the dealer already
   made in WhatsApp.
2. **A cookie from a previous visit** — so if the dealer comes back to the
   site later without a `lang` param (e.g. bookmarked it), it remembers.
3. **Browser `Accept-Language` / `navigator.language`** — a real fallback
   guess for cold visits with no param and no cookie.
4. **Default: English** — if all three above are inconclusive.

---

## Step 1 — Standardize the language value in Interakt

In the bilingual flow doc, the language was saved as `English` / `Arabic`.
For URL use, switch to a **short, URL-safe code** — save it as `lang` with
value `en` or `ar` directly from each button tap (instead of, or alongside,
the full word). This is the same variable your Condition node branches on,
so no extra step in Interakt — just change what value each button saves.

Then, on every "Send a Message" node in the AR branch that contains a link,
insert that variable into the URL, e.g.:

```
https://dealer.impexksa.com/dealer-register?phone={{1}}&lang={{2}}
```

where `{{2}}` maps to the `lang` variable (`ar` in the Arabic branch, `en` in
the English branch). Do this for all three links: dealer registration,
pickup request, and ticket status.

---

## Step 2 — Read the param in the web app

Create a small utility that resolves language once per page load:

```js
// utils/getLanguage.js
export function resolveLanguage(query, cookieHeader) {
  // 1. Explicit param wins
  if (query?.lang === "ar" || query?.lang === "en") {
    return query.lang;
  }

  // 2. Cookie from a previous visit
  const cookieMatch = /impex_lang=(ar|en)/.exec(cookieHeader || "");
  if (cookieMatch) {
    return cookieMatch[1];
  }

  // 3. Browser preference (client-side only — see note below)
  if (typeof navigator !== "undefined" && navigator.language) {
    if (navigator.language.toLowerCase().startsWith("ar")) return "ar";
  }

  // 4. Default
  return "en";
}
```

Server-side (`getServerSideProps`), you have access to the request headers
directly, which lets you also check `Accept-Language` before the page even
renders — this avoids a flash of English content before JS runs:

```js
// pages/index.js
export async function getServerSideProps({ query, req }) {
  const acceptLang = req.headers["accept-language"] || "";
  const cookieHeader = req.headers.cookie || "";

  let lang = "en";
  if (query.lang === "ar" || query.lang === "en") {
    lang = query.lang;
  } else if (/impex_lang=ar/.test(cookieHeader)) {
    lang = "ar";
  } else if (acceptLang.toLowerCase().startsWith("ar")) {
    lang = "ar";
  }

  return { props: { initialLang: lang } };
}
```

Pass `initialLang` into the page component as the starting state.

---

## Step 3 — Persist the choice in a cookie

So the next visit (even without `?lang=`) remembers it:

```js
useEffect(() => {
  document.cookie = `impex_lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
}, [lang]);
```

---

## Step 4 — Apply the language across the page

Two things need to flip together: the **text** and the **direction** (Arabic
is RTL — this matters more than the text itself for how broken the layout
looks if you skip it).

```js
// pages/_app.js
function MyApp({ Component, pageProps }) {
  const [lang, setLang] = useState(pageProps.initialLang || "en");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <Component {...pageProps} />
    </LanguageContext.Provider>
  );
}
```

Keep a simple dictionary rather than a full i18n library (probably overkill
for a two-page app):

```js
// locales/strings.js
export const strings = {
  en: {
    formTitle: "Dealer Pickup Request",
    submit: "Submit",
    // ...
  },
  ar: {
    formTitle: "طلب استلام الوكيل",
    submit: "إرسال",
    // ...
  },
};
```

Then in components: `const t = strings[lang];` and use `t.formTitle`, etc.

---

## RTL gotchas worth knowing before you start

- `dir="rtl"` flips `flex-direction`, text alignment, and the visual order of
  most layouts automatically — but anything with hardcoded `margin-left` /
  `padding-right` etc. (instead of logical properties like `margin-inline-start`)
  will look wrong and need manual fixing.
- Numbers, phone numbers, and the ticket ID format (`IMX-KSA-00001`) should
  stay LTR even inside an RTL page — wrap them in `<span dir="ltr">` so they
  don't visually reverse.
- Icons implying direction (arrows, "next" chevrons) may need mirroring in RTL.

---

## What this does *not* need to touch

- No changes to `/api/pickup/create.js` or any n8n workflow — this is purely
  a front-end display concern. The Google Sheets writes, ticket IDs, and
  webhook calls are language-agnostic already.
- `/admin` is presumably an internal staff tool — you may want to leave it
  English-only rather than apply this there. Your call; the same mechanism
  would work if you do want it bilingual too.

---

## If you want this scoped precisely to your actual code

I don't have access to your Vercel repo, so the snippets above are patterns
to adapt rather than drop-in diffs. If you share the actual `pages/index.js`,
`pages/admin/*`, and `pages/_app.js` files, I can give you exact edits instead
of the general shape.
