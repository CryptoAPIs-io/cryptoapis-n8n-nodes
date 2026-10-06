#!/usr/bin/env node
'use strict'

// Dry-run gate for the auto-changelog configuration in `.changelog/` and
// package.json's "auto-changelog" key. Runs the exact two command forms
// node-cli's `n8n-node release` uses (see CLAUDE.md "Release"), but with
// `--stdout` and `--latest-version` substituted for `-p`/the real bump so
// nothing is written to CHANGELOG.md, package.json, or git. Exits non-zero
// if either command's output would reintroduce pre-tag history, drop the
// backfilled entries, duplicate a commit, or list a merge commit.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import changelogShared from './changelog-shared.js'

const {
  REPO_ROOT,
  getPostTagCommits,
  isAncestor,
  getCommitterDate,
  isMergeSubject
} = changelogShared

const COMMIT_BULLET_PATTERN = /^- (.+) \[`([0-9a-f]{7,40})`\]\([^)]*\)$/gm
const HEADING_PATTERN = /^## \[/gm

function fail(message) {
  console.error(`changelog:check: ${message}`)
  process.exitCode = 1
}

function run(args) {
  return execFileSync('npx', args, { cwd: REPO_ROOT, encoding: 'utf8' })
}

function nextPatchVersion() {
  const pkg = JSON.parse(readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'))
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(pkg.version)
  if (!match) {
    throw new Error(`package.json version '${pkg.version}' is not major.minor.patch`)
  }
  const [, major, minor, patch] = match
  return `${major}.${minor}.${Number(patch) + 1}`
}

function extractBullets(text) {
  return [...text.matchAll(COMMIT_BULLET_PATTERN)].map(([, subject, hash]) => ({ subject, hash }))
}

// Verifies a printed commit list against first principles (not against
// getPostTagCommits' own selection, to avoid asserting a function against
// itself): every hash must postdate `tag`, not be one of its ancestors, not
// be a merge-pattern subject, and no subject may repeat.
function validateBullets(label, text, tag, tagDate, expectedHashes) {
  const tagTime = new Date(tagDate).getTime()
  const bullets = extractBullets(text)
  const seenSubjects = new Set()
  const seenHashes = new Set()

  for (const { subject, hash } of bullets) {
    if (isMergeSubject(subject)) {
      fail(`${label}: lists a merge commit '${subject}' (${hash})`)
      continue
    }
    if (isAncestor(hash, tag)) {
      fail(`${label}: lists ${hash} ('${subject}'), which is reachable from ${tag}`)
      continue
    }
    const commitTime = new Date(getCommitterDate(hash)).getTime()
    if (commitTime <= tagTime) {
      fail(`${label}: lists ${hash} ('${subject}'), whose committer date is not after ${tag}'s`)
      continue
    }
    if (seenSubjects.has(subject)) {
      fail(`${label}: subject '${subject}' is listed twice`)
      continue
    }
    seenSubjects.add(subject)
    seenHashes.add(hash)
  }

  const missing = [...expectedHashes].filter(hash => !seenHashes.has(hash))
  for (const hash of missing) {
    fail(`${label}: is missing expected commit ${hash}`)
  }

  return bullets
}

function checkNoMergedList(label, text) {
  if (text.includes('### Merged')) {
    fail(`${label}: contains a "### Merged" PR list; pre-tag PR merges must not be listed`)
  }
}

function main() {
  let tag
  let tagDate
  let commits
  try {
    const result = getPostTagCommits()
    tag = result.tag
    tagDate = result.tagDate
    commits = result.commits
  } catch (error) {
    fail(error.message)
    process.exit(process.exitCode || 1)
  }

  const expectedHashes = new Set(commits.map(c => c.hash.slice(0, 7)))
  console.log(`Latest tag: ${tag} (${tagDate})`)
  console.log(`Post-tag commits (${commits.length}):`)
  for (const commit of commits) {
    console.log(`  - ${commit.subject} [${commit.hash.slice(0, 7)}]`)
  }
  if (commits.length === 0) {
    console.warn(
      'changelog:check WARNING: no post-tag commits found. This is also the ' +
      'signature of a branch committed before the latest tag but merged ' +
      'after it (its commits predate the tag and are dropped by the date ' +
      'rule) — check for late-merged branches before releasing.'
    )
  }

  // --- after:bump form: `npx auto-changelog -p`, as a dry run ---
  const nextVersion = nextPatchVersion()
  const generated = run(['auto-changelog', '--stdout', '--latest-version', nextVersion])

  const current = readFileSync(path.join(REPO_ROOT, 'CHANGELOG.md'), 'utf8')
  const tagHeading = `## [${tag}]`
  const splitIndex = current.indexOf(tagHeading)
  if (splitIndex === -1) {
    fail(`CHANGELOG.md has no '${tagHeading}' heading to anchor the comparison`)
  } else {
    const expectedIntro = current.slice(0, splitIndex)
    const expectedRest = current.slice(splitIndex)

    console.log('\n--- generated (after:bump dry run) ---')
    console.log(generated)

    if (!generated.startsWith(expectedIntro)) {
      fail('after:bump output: the intro before the latest tag heading differs from CHANGELOG.md')
    } else if (!generated.endsWith(expectedRest)) {
      fail(`after:bump output: content from '${tagHeading}' onwards differs from CHANGELOG.md`)
    } else {
      const section = generated.slice(expectedIntro.length, generated.length - expectedRest.length)
      const sectionHeadingCount = [...section.matchAll(HEADING_PATTERN)].length
      if (sectionHeadingCount !== 1) {
        fail(`after:bump output: expected exactly one "## [" heading in the inserted section, found ${sectionHeadingCount}`)
      }
      checkNoMergedList('after:bump', section)
      validateBullets('after:bump', section, tag, tagDate, expectedHashes)
    }
  }

  // --- release-notes form, exact command node-cli's release-it hook runs ---
  const releaseNotes = run([
    'auto-changelog',
    '--stdout',
    '--unreleased',
    '--commit-limit',
    'false',
    '-u',
    '--hide-credit'
  ])

  console.log('\n--- release notes ---')
  console.log(releaseNotes)

  checkNoMergedList('release-notes', releaseNotes)
  validateBullets('release-notes', releaseNotes, tag, tagDate, expectedHashes)

  const headingCount = [...releaseNotes.matchAll(HEADING_PATTERN)].length
  if (headingCount !== 1) {
    fail(`release-notes output: expected exactly one "## [" heading, found ${headingCount} (pre-tag releases must not appear)`)
  }

  if (process.exitCode) {
    console.error('\nchangelog:check FAILED')
  } else {
    console.log('\nchangelog:check OK')
  }
}

main()
