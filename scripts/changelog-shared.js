'use strict'

// Shared between `.changelog/handlebars-setup.js` (which feeds the real
// `auto-changelog` runs) and `scripts/check-changelog.mjs` (which verifies
// their output). Kept dependency-free so it only needs `git` on PATH.

const { execFileSync } = require('node:child_process')
const path = require('node:path')

const REPO_ROOT = path.resolve(__dirname, '..')

const TAG_FETCH_HINT =
  "no v* tag is reachable from HEAD. Fetch GitHub's tags first:\n" +
  "  git fetch https://github.com/CryptoAPIs-io/cryptoapis-n8n-nodes.git 'refs/tags/*:refs/tags/*'"

// Hosting-generated PR merge messages (GitHub "Merge pull request #N from …",
// GitHub squash "… (#N)", GitHub "Merge … (PR #N)", Bitbucket "Merged in …
// (pull request #N)"), as opposed to a deliberately authored commit that
// happens to have two parents (e.g. "chore(FLEET-1178): join GitHub main's
// history into master"), which is real history and must stay listed.
const MERGE_SUBJECT_PATTERN = /^Merge\b|^Merged in .+\(pull request #\d+\)/

function git(args) {
  return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' }).trim()
}

function isAncestor(ref, of) {
  try {
    git(['merge-base', '--is-ancestor', ref, of])
    return true
  } catch {
    return false
  }
}

function parseVersion(tag) {
  const match = /^v(\d+)\.(\d+)\.(\d+)$/.exec(tag)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function compareVersions(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

// The latest v* tag reachable from HEAD, chosen by version rather than tag
// creation order, so it keeps working unchanged after the next release.
function getLatestTag() {
  const tags = git(['tag', '-l', 'v*']).split('\n').filter(Boolean)
  let best = null
  let bestVersion = null
  for (const tag of tags) {
    const version = parseVersion(tag)
    if (!version) continue
    if (!isAncestor(tag, 'HEAD')) continue
    if (!bestVersion || compareVersions(version, bestVersion) > 0) {
      best = tag
      bestVersion = version
    }
  }
  if (!best) {
    throw new Error(TAG_FETCH_HINT)
  }
  return best
}

function getCommitterDate(ref) {
  return git(['log', '-1', '--format=%cI', ref])
}

function isMergeSubject(subject) {
  return MERGE_SUBJECT_PATTERN.test(subject)
}

// Non-merge commits reachable from HEAD but not from the latest tag, whose
// committer date is strictly after the tag commit's, deduplicated by subject
// (the most recent occurrence of a repeated subject wins).
function getPostTagCommits(tag = getLatestTag()) {
  const tagDate = getCommitterDate(tag)
  const tagTime = new Date(tagDate).getTime()
  const log = git(['log', `${tag}..HEAD`, '--format=%H%x1f%cI%x1f%s'])
  const seenSubjects = new Set()
  const commits = []
  if (log) {
    for (const line of log.split('\n')) {
      const [hash, date, subject] = line.split('\x1f')
      if (new Date(date).getTime() <= tagTime) continue
      if (isMergeSubject(subject)) continue
      if (seenSubjects.has(subject)) continue
      seenSubjects.add(subject)
      commits.push({ hash, date, subject })
    }
  }
  return { tag, tagDate, commits }
}

module.exports = {
  REPO_ROOT,
  TAG_FETCH_HINT,
  MERGE_SUBJECT_PATTERN,
  isAncestor,
  getLatestTag,
  getCommitterDate,
  isMergeSubject,
  getPostTagCommits
}
