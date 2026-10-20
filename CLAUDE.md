# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Lint, and Dev Commands

```bash
npm install          # install dependencies
npm run build        # tsc + gulp build:icons (copies SVGs to dist/)
npm run dev          # tsc --watch for iterative development
npm run lint         # tsc --noEmit && eslint .  — the real gate; run this
npm run typecheck    # tsc --noEmit only
npm run lint:scan    # n8n-node lint (the CLI's own rule set, for comparison)
npm run release      # cut a release — see "Release" below. Run from `main`
```

There are no automated tests. `npm run lint` is the primary validation step and is
what the release flow runs before publishing.

**`npm run lint` must stay the real linter.** It used to be `tsc --noEmit` alone,
which reported clean while n8n's verification scanner found 10 errors — a
type-check cannot see n8n's node conventions. If you need type-checking on its
own, use `npm run typecheck`.

**Verifying against n8n's actual gate.** `npx eslint .` is weaker than what n8n
runs, because `@n8n/scan-community-package` builds its *own* ESLint config,
ignores `.eslintrc.js` entirely, and loads `@n8n/eslint-plugin-community-nodes`.
`.eslintrc.js` is deliberately kept in sync with that config — if the two ever
disagree, this file is wrong. To check the published package the way n8n's
reviewers do:

```bash
npx @n8n/scan-community-package @cryptoapis-io/n8n-nodes-cryptoapis
```

**Never run `eslint --fix` in this repo.** Verified destructive twice: it left
parsing errors in four files, and it rewrote domain terminology into nonsense
(`xPub` → "x pub", `BCH` → "bch", `EIP-1559` → "eip 1559") because the
sentence-case rules cannot tell an acronym from a typo. Fix findings by hand.

## Architecture Overview

This is a single n8n community node package exposing the Crypto APIs REST API (`https://rest.cryptoapis.io`) to n8n workflows. It is structured as follows:

```
credentials/
  CryptoApisApi.credentials.ts   # API key auth + credential test endpoint
nodes/CryptoApis/
  CryptoApis.node.ts             # INodeType class; declares all properties and calls router
  CryptoApis.node.json           # Codex metadata (categories, aliases)
  actions/
    router.ts                    # Dispatches resource → execute function
    <resource>/
      index.ts                   # Exports *Operations and *Fields arrays for the node descriptor
      execute.ts                 # Runtime logic for each operation in the resource
  transport/
    requestHelpers.ts            # cryptoApisRequest(), unwrapResponse/unwrapSingleItem/unwrapItems
    paginationHelpers.ts         # handleOffsetPagination(), handleCursorPagination()
    blockchainConstants.ts       # Blockchain/network lists, chain IDs, dropdown option builders
```

The 14 resources are: `addressHistory`, `addressLatest`, `aml`, `blockData`, `blockchainEvents`, `blockchainFees`, `broadcast`, `contracts`, `hdWallet`, `marketData`, `prepareTransactions`, `simulate`, `transactionsData`, `utils`.

## Key Patterns and Conventions

### Adding a new resource

1. Create `nodes/CryptoApis/actions/<resource>/index.ts` — export `<resource>Operations: INodeProperties[]` and `<resource>Fields: INodeProperties[]`.
2. Create `nodes/CryptoApis/actions/<resource>/execute.ts` — export `execute<Resource>(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]>`.
3. Import and spread both arrays into `CryptoApis.node.ts` properties.
4. Add a `case` in `actions/router.ts`.

### Adding an operation to an existing resource

- Add the option to the `operation` field's `options` array in `index.ts`.
- Add a corresponding `if (operation === '...')` block in `execute.ts`.
- Add any new field definitions (with correct `displayOptions`) in `index.ts`.

### HTTP requests

All API calls go through `cryptoApisRequest()` in `transport/requestHelpers.ts`. It:
- Reads `apiKey` and `apiUrl` from credentials.
- Sets `x-api-key` and `x-api-version: 2024-12-12` headers (via the credential `authenticate` config).
- Automatically wraps `POST`/`PUT` bodies as `{ data: { item: { ... } } }`.
- Throws `NodeApiError` on failure.

Unwrap helpers: use `unwrapSingleItem()` for single-object responses and `unwrapItems()` for arrays. Never access `response.data` directly in execute files.

### Pagination

- **Offset pagination** (`handleOffsetPagination`): used by resources like `blockchainEvents`, `marketData`. Page size capped at 50.
- **Cursor pagination** (`handleCursorPagination`): used by `addressHistory`, `addressLatest`, etc. Reads `meta.cursors.nextStartingAfter` from responses.

Both helpers accept `returnAll: boolean` and `limit: number`. When `returnAll=false` and `limit` is provided, expose both `Return All` (boolean) and `Limit` (number, hidden when `returnAll=true`) fields in `index.ts`.

### Blockchain/network handling

`transport/blockchainConstants.ts` is the single source of truth for:
- `EVM_BLOCKCHAINS`, `UTXO_BLOCKCHAINS`, and protocol-specific lists.
- `BLOCKCHAIN_NETWORKS` mapping for valid blockchain→network combinations.
- `blockchainOptions()` and `networkOptions()` for building n8n dropdown option arrays.
- `validateBlockchainNetwork()` for runtime validation.
- `getChainIdForNetwork()` for EVM chain ID lookups.

Always import from `blockchainConstants.ts` rather than hardcoding blockchain or network strings.

### TypeScript

`strict: true` is enabled. Target is `es2022`, module is `commonjs`, output goes to `dist/`. All source lives under `credentials/` and `nodes/` — both are included in `tsconfig.json`. Icons (SVG files) are copied to `dist/` via gulp.

### ESLint

Uses `eslint-plugin-n8n-nodes-base` with separate rule sets for node files, credential files, and `package.json`. Run via `npm run lint` (which also type-checks).

`.eslintrc.js` mirrors the config that `@n8n/scan-community-package` builds, so a local run and n8n's gate agree. The overrides, each with the reason inline:

- `cred-class-field-documentation-url-miscased` — off; community nodes use full HTTP URLs, not n8n doc slugs.
- `node-param-type-options-max-value-present` — off; block heights and confirmation targets are open-ended, and n8n's scanner disables it for the same reason.
- `node-class-description-inputs-wrong-regular-node` / `-outputs-wrong` — off; these predate the `NodeConnectionTypes` enum and demand the `'main'` literal, while the scanner's `node-connection-type-literal` rule requires the enum. The scanner turns both off.

The node files must be linted as `nodes/**/*.ts`, **not** `nodes/**/*.node.ts`. The narrower glob linted exactly one file and left every `actions/<resource>/index.ts` unchecked, which is how 43 scanner findings hid behind a clean local run.

## Release

Releases are managed by `@n8n/node-cli`, which keeps the repository and npm in sync and generates release notes:

```bash
git checkout main && git merge --ff-only github/main
npm run release
```

This lints, builds, prompts for the version bump, regenerates `CHANGELOG.md`, commits, tags `vX.Y.Z`, pushes, and creates the GitHub release. Pushing the tag triggers `.github/workflows/publish.yml`, which publishes to npm with provenance via OIDC trusted publishing (there is no `NPM_TOKEN` secret, and there should not be).

GitHub `main` and Bitbucket `master` share one history (see "Git Remotes & Branching" in `.claude/CLAUDE.md`). Before releasing, push `master:main` so the release includes everything merged on Bitbucket. The release commit lands on GitHub only; bring it back to Bitbucket afterwards as a fast-forward (open a PR from it if `master` refuses a direct push):

```bash
git checkout master && git merge --ff-only github/main && git push origin master vX.Y.Z
```

Things that will bite:

- **Release from `main`, never `master`.** The CLI passes `--git.requireBranch main`, and release-it pushes to the current branch's upstream — `master` tracks Bitbucket, so releasing from it fails the branch check and would target the wrong host. A `.release-it.json` cannot override this: CLI args win over config.
- **`release-it` is pinned to `^20`.** The CLI passes `-n`, which release-it 21 rejects outright (`Unknown option '-n'`), so `n8n-node release` cannot run against 21.
- **`auto-changelog` is pinned to `~2.6.0`, not `^2.6.0`.** 2.7.0 refuses to run against this repo's in-repo config ("Refusing to run: in-repo config ... sets unsafe options: handlebarsSetup loads code"), because `.changelog/handlebars-setup.js` loads code — exactly what 2.6.x allows and 2.7+ blocks. A caret range lets `npm install`/a regenerated lock resolve 2.7+ and break both `changelog:check` and the release's `npx auto-changelog -p`; the tilde range cannot.
- **Never publish from a laptop.** n8n has required Actions-published provenance since 1 May 2026; a locally published package can never become verified. `n8n-node release --publish` does exactly this — don't use it.
- **npm never allows republishing a version.** Check the published version before assuming a release will succeed.
- **`publishConfig` carries `access: public` and `provenance: true`**, because the CLI's CI path runs a bare `npm publish` without the flags the old workflow passed explicitly.
- `CHANGELOG.md` entries up to v0.3.0 were backfilled by hand from the published GitHub releases. `auto-changelog`'s link URLs are set explicitly in `package.json` because the `github` remote is an SSH host alias (derived links would point at a non-existent host) and `origin` is Bitbucket (whose links 404 for public readers).
- **`n8n-node release`'s two `auto-changelog` invocations, confirmed from the installed `node_modules/@n8n/node-cli/dist/commands/release.js`:** the after:bump hook runs `npx auto-changelog -p` (writes `CHANGELOG.md`, version from the just-bumped `package.json`); the GitHub release notes come from `--git.changelog="npx auto-changelog --stdout --unreleased --commit-limit false -u --hide-credit"`. Both are fixed CLI args release-it passes — they cannot be changed without forking the CLI, so the fix for the join-history bug below lives entirely in `auto-changelog`'s own configuration.
- **The changelog keeps the backfilled entries and lists only post-tag commits.** Bitbucket `master` and GitHub `main` were joined into one history (see "Git Remotes & Branching" above), so `git log <tag>..HEAD` on its own cannot tell "shipped before the tag" apart from "merged in later from the other side of the join" — both land in that range. `package.json`'s `"auto-changelog"` key points `template` and `handlebarsSetup` at `.changelog/template.hbs` / `.changelog/handlebars-setup.js`, which recompute the commit list themselves (`scripts/changelog-shared.js`): the latest `v*` tag reachable from HEAD (by version, not a hardcoded one) is `L`; a commit is listed only if its **committer date** is strictly after `L`'s and it isn't a hosting-generated PR-merge commit, deduplicated by subject. The handlebars-setup then writes/prints the result itself and exits, bypassing `auto-changelog`'s own output step — its `cleanTemplate()` unconditionally strips leading whitespace after every newline, which would mangle the hand-backfilled entries' wrapped, indented bullet lines.
- **Tags live on GitHub only.** A Bitbucket-only clone has no tags, so `L` can't be found. Fetch them first: `git fetch https://github.com/CryptoAPIs-io/cryptoapis-n8n-nodes.git 'refs/tags/*:refs/tags/*'` (public, no auth).
- **`npm run changelog:check`** (`scripts/check-changelog.mjs`) dry-runs both commands above (`--stdout` plus `--latest-version <next patch>` standing in for `-p`) without writing `CHANGELOG.md`, bumping the version, or touching any tag, and fails if a listed commit predates or is reachable from `L`, a subject repeats, a merge commit is listed, or the generated file differs from `CHANGELOG.md` anywhere outside the one new section. Run it after fetching tags, alongside `npm run lint`, before any release.
- **The committer-date rule has a blind spot: a branch committed before the latest tag but merged after it disappears from the changelog.** Its own commits predate `L` and get dropped, and the merge commit itself is filtered as a hosting-generated PR-merge subject. `changelog:check` prints a warning when it finds zero post-tag commits, since that is the same symptom — check for late-merged branches before releasing in that case. A release with zero qualifying commits still inserts a placeholder `## [vX]` section (`_No changes since the latest tag._`) rather than skipping the heading, so the next release's lookup for that heading keeps working.
- This config was added and dry-run verified (FLEET-1186, re-scoped 2026-10-06) without cutting a release. The original FLEET-1186 round-trip — releasing from the joined history, tagging, publishing to npm, and creating the GitHub release — is verified on the next functional `n8n-nodes` release, not by a docs/config-only change.
