# AGENTS.md

Guidance for AI coding agents (and humans) contributing to this repository. Read this before making changes.

## What this repository is

`redhat-actions/buildah-build` is a **GitHub Action** written in TypeScript that builds container images with
[buildah](https://buildah.io/). It is not a library: the shipped artifact is the bundled `dist/index.js`, which is
committed to the repository and executed by GitHub Actions.

Key behaviours to keep in mind:

- It shells out to `buildah` (and `podman` as a fallback) rather than calling an API.
- It supports Containerfile builds, "scratch" builds (no Containerfile), multi-arch builds, and running buildah
  inside a container via the `buildah-image` input.
- The related [`push-to-registry`](https://github.com/redhat-actions/push-to-registry) action does the pushing.

## Non-negotiable rules

1. **Rebuild and commit the bundle for every `src/` change.**
   Run `npm run bundle` and commit both `dist/index.js` and `dist/index.js.map`. CI's `check-dist` job reruns
   `npm run bundle` and fails on any diff. Never edit `dist/` by hand.

2. **Never hand-edit `src/generated/inputs-outputs.ts`.**
   It is generated from `action.yml` by `action-io-generator`. Change `action.yml`, then run `npm run generate-ios`.
   CI's `check-inputs-outputs` job verifies this file is current.

3. **Keep `action.yml`, `README.md`, and the generated enums in sync.**
   `action.yml` is the source of truth for inputs/outputs. User-facing documentation lives in the README tables.

4. **One logical change per PR.**
   Do not mix dependency bumps, formatting sweeps, or refactors with a feature/fix. Reviewers will ask you to split
   them. Do not "fix" unrelated typos or reformat untouched files.

5. **Match the existing code style.**
   4-space TypeScript, 2-space YAML, semicolons, double quotes, max line length 120. Use `core.info` /
   `core.warning` / `core.error` — never `console` (ESLint enforces `no-console`).

6. **Respect the minimum Node version.** `engines.node` is `>=20`; `action.yml` runs on `node24`; the esbuild bundle
   targets `node20`. Don't use APIs unavailable on Node 20.

## Repository layout

| Path | Purpose |
| ---- | ------- |
| `action.yml` | Source of truth for action inputs/outputs and runtime. |
| `src/index.ts` | Entry point: `run()`, input parsing, build orchestration, multi-arch/manifest handling. |
| `src/buildah.ts` | `BuildahCli` wrapper. Builds the `buildah`/`podman` argument arrays and executes them. |
| `src/utils.ts` | Pure helpers and environment probing. |
| `src/types.ts` | `CommandResult` type. |
| `src/generated/inputs-outputs.ts` | **Generated** `Inputs`/`Outputs` enums. Do not edit. |
| `src/*.test.ts` | Vitest unit tests, colocated with sources. |
| `dist/` | **Committed** esbuild bundle. Regenerated, never edited. |
| `.github/workflows/` | CI and integration tests that run the action itself. |
| `git-hooks/pre-commit` | Optional local hook that regenerates enums, lints, bundles, and stages outputs. |
| `CHANGELOG.md` | Curated at release time; don't add entries unless asked. |

## Setup and common commands

```bash
npm ci                    # always install from the lockfile
npm run lint              # ESLint (tests and config files are ignored)
npm test                  # Vitest, fast
npm run bundle            # rebuild dist/index.js + dist/index.js.map
npm run generate-ios      # regenerate src/generated/inputs-outputs.ts from action.yml
```

Type-checking:

```bash
npx tsc -p . --ignoreDeprecations 6.0 --noEmit
```

`npm run compile` currently fails with `TS5107` because `tsconfig.json` sets `moduleResolution: "node"`, which
TypeScript 6 deprecates. This is pre-existing and not run by CI; don't fix it as part of an unrelated PR.

Optional: copy `git-hooks/pre-commit` to `.git/hooks/pre-commit` so the generated enums and bundle are always staged.

## Testing expectations

- Tests use Vitest and live next to the code (`src/buildah.test.ts`, `src/utils.test.ts`). Test files are excluded
  from ESLint and from `tsconfig.json`, so lint/type-check will not catch mistakes there — keep them clean yourself.
- `src/buildah.test.ts` mocks `@actions/core`, `@actions/exec`, and `./utils`, and records every exec call in
  `execCallLog`. Use the existing helpers (`setExecMock`, `findExecCall`, `findAllExecCalls`, `isPodmanRun`) and
  assert on the **exact argument array** for CLI wrappers, e.g.
  `["manifest", "create", "--annotation", "a=b", "name"]`.
- `beforeEach` clears mocks and the exec log; don't leak state between tests.
- Pure logic belongs in `src/utils.ts` so it can be unit tested. `run()` in `src/index.ts` has no unit tests — its
  behaviour is covered by the integration workflows. When you change build behaviour, prefer extracting a pure
  helper and testing it, and/or extend the relevant workflow.
- Cover both the success path and the fallback/error path. For version-gated features, test the supported,
  unsupported, and unknown-version cases.

## Buildah / podman compatibility (read this before adding CLI flags)

The action may invoke three different CLIs, and their versions are independent:

| Mode | How it is selected | Version reported by `cli.execute(["version"])` |
| ---- | ------------------ | ---------------------------------------------- |
| Native buildah | `buildah` on `PATH` | buildah |
| Podman fallback | `buildah` not found; Containerfile builds only | **podman** |
| `buildah-image` | buildah runs via `podman run ... buildah` | buildah |

Rules:

- **Never assume the version is buildah's.** In podman fallback mode (`usePodman === true`), the version string is
  podman's. Compare it against the correct minimum for that CLI.
- **Check upstream docs/source before adding a flag.** Do not assume a flag exists on the buildah shipped by a runner.
  Example from PR #225: `buildah manifest create --annotation` requires **buildah >= 1.35**, while
  `podman manifest create --annotation` requires **podman >= 5.0** (absent in 3.x/4.x, which are still common on
  Ubuntu runners). `buildah manifest annotate --index` is also 1.35+.
- **Gate the feature and explain the failure.** Either fail fast with an actionable message (mention
  `buildah-image: quay.io/buildah/stable`) or warn once and preserve the previous behaviour. Never silently drop
  user-requested metadata — that was the original bug in #224.
- **Gate early.** If a feature is unsupported, say so before doing a long multi-arch build, not at the last step.
- **Warn/error once per run**, outside per-tag/per-arch loops.
- Use the `semver` package (`extractVersion` in `src/utils.ts`, `SemVer.compare`) for version comparisons.
- Document any new minimum version in the README next to the relevant input.
- Add or extend a workflow on a runner/CLI that actually supports the feature. Current reference points:
  `ubuntu-24.04` ships buildah 1.33, `ubuntu-26.04` ships buildah 1.42.

## Adding or changing an input/output

1. Edit `action.yml` (description, `required`, `default`). Keep the style of neighbouring entries.
2. Run `npm run generate-ios` to update `src/generated/inputs-outputs.ts`.
3. Use `Inputs.<NAME>` / `Outputs.<NAME>` in TypeScript — never raw input strings.
4. Parse list inputs with the existing helpers: `getInputList`, `splitByNewline`, `getCommaSeperatedInput`.
5. Update the corresponding README table(s): *Common Inputs*, *Inputs for build from containerfile*,
   *Inputs for build without containerfile*, or *Action Outputs*.
6. Add tests and, if the input changes runtime behaviour, an integration workflow case.
7. Run `npm run lint && npm test && npm run bundle`.
8. If `src/generated/inputs-outputs.ts` changed, commit it together with `action.yml` and the README.

## CI and integration workflows

- `ci.yml`: lint, unit tests, bundle freshness (`check-dist`), generated enums (`check-inputs-outputs`).
- `containerfile_build.yml`: Containerfile builds — native buildah, containerized buildah, case normalization.
- `scratch_build.yml`: builds without a Containerfile.
- `multiarch.yml`: `archs`/`platforms`, multi-arch manifests, qemu setup.
- `docker_metadata_action.yml`: interop with `docker/metadata-action`.
- `link_check.yml`: markdown link checking (runs on `**.md` changes).
- Fork pull requests may need maintainer approval before workflows run. Don't rely on CI alone: run
  `npm run lint`, `npm test`, and `npm run bundle` locally, and tell the reviewer what you ran.
- Dependabot PRs are handled separately (`dependabot-auto-merge.yml`, `dependabot-rebuild.yml`); do not manually
  bump dependencies in a feature PR.

## Commits and pull requests

- Branch from the latest `main`; keep the branch focused.
- Use a descriptive subject that explains the *why*, matching existing history, e.g.
  `fix: capitalize OCI SDK struct field`, `ci: add workflow to auto-approve ...`,
  `Fix squash input documentation to match actual behavior`. Reference the issue/PR number where applicable.
- Squash fixup commits into a clean, atomic commit before requesting review.
- In the PR description, note whether the change is user-facing, whether it needs docs/tests, and whether it is a
  patch/minor/major change.
- Report exactly what you verified (commands, runners, buildah version) so reviewers can reproduce it.

## Pre-submit checklist

- [ ] `action.yml` updated (if inputs/outputs/runtime changed)
- [ ] `npm run generate-ios` run and `src/generated/inputs-outputs.ts` committed (if applicable)
- [ ] README tables/docs updated
- [ ] Unit tests added/updated and `npm test` passes
- [ ] `npm run lint` passes
- [ ] `npm run bundle` run and `dist/index.js` + `dist/index.js.map` committed
- [ ] Version-gated CLI features checked against upstream buildah **and** podman minimums
- [ ] Integration workflow updated when behaviour is only verifiable end-to-end
- [ ] No unrelated dependency bumps, refactors, or formatting changes
