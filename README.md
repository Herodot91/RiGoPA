# RiGoPA – Risk Governance for Public Administration

A prototype that checks public-sector contracts for risk. It scores each contract, runs policy checks, tracks the
four pillars of a decentralization formula, and shows a citizen-facing view of public spending.
All data is sample data.

**Live demo:** https://herodot91.github.io/RiGoPA/

Originally created in Google AI Studio: [ppk1991/RiGoPA](https://github.com/ppk1991/RiGoPA).
This repository adds a read-only REST API for the data, API standards checks, and deployment to GitHub Pages.

## The API

The app loads its contracts and its risk register through a small read-only REST API under `/api/v1`.
The API is described in [`docs/openapi.yaml`](docs/openapi.yaml) (OpenAPI 3).

| Method | Path | Returns |
|---|---|---|
| GET | `/api/v1/contracts.json` | The contract register, each with risk analysis, policy checks, decentralization steps and audit log |
| GET | `/api/v1/system-risks.json` | Risks of implementing the system itself, with likelihood, impact, score and mitigation |

The responses are JSON files in [`public/api/v1`](public/api/v1), published next to the app. That is why the paths
end in `.json` and why only `GET` exists. Contracts you add, edit or import in the app are kept in your browser
(local storage) and are not written back. The client is [`services/api.ts`](services/api.ts).

## Gemini (AI insights)

The app can ask the Gemini API for a short audit of a contract and for answers in the citizen chat.
This needs your own key, and **the published demo is built without one**, so those two features show a
"key is missing" message there. A key placed in a public web bundle can be read by anyone, so do not deploy with one.
To try the AI features, run the app locally with a key (below).

## API standards, checked in GitHub Actions

- **Spectral** checks the spec against Spectral's OpenAPI rules plus 11 house rules in
  [`.spectral.yaml`](.spectral.yaml): versioned paths, kebab-case paths, camelCase properties, PascalCase schema names,
  every property described, every response has an example, GET only.
- **Contract test** ([`tools/contract-test.mjs`](tools/contract-test.mjs)) checks that every JSON file matches its schema
  in the spec, that every example matches too, and that no file is served without being documented.

## Run locally

```bash
npm install
npm run dev
```

To use the Gemini features, put `GEMINI_API_KEY=your-key` in `.env.local` first.

Check the API standards:

```bash
npx @stoplight/spectral-cli@6.17.0 lint docs/openapi.yaml
npm install --prefix tools --no-save ajv@8.17.1 ajv-formats@3.0.1 js-yaml@4.1.0
node tools/contract-test.mjs
```

## What changed from the AI Studio export

- The contracts and the risk register now come from the API instead of being written inside `App.tsx` and `ProjectRiskDashboard.tsx`.
- `index.html` loads `index.tsx` and no longer uses an import map.
- `vite.config.ts` sets the Pages base path and builds with an empty Gemini key unless `GEMINI_API_KEY` is set.
