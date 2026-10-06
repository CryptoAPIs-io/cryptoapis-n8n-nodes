'use strict'

// Registered via the "auto-changelog" > "handlebarsSetup" key in
// package.json. Both node-cli release commands end up here:
//   - after:bump: `npx auto-changelog -p` (options.latestVersion set from
//     package.json's version)
//   - release notes: `npx auto-changelog --stdout --unreleased
//     --commit-limit false -u --hide-credit` (options.unreleased, no
//     options.latestVersion)
// See CLAUDE.md "Release" for why this can't live in the release command
// itself.
//
// This helper writes/prints the final changelog itself and exits instead of
// returning the content to Handlebars. auto-changelog's compileTemplate()
// unconditionally pipes the rendered template through cleanTemplate(), which
// strips leading whitespace after every newline and collapses blank-line
// runs across the *whole* output (it assumes only the .hbs template source
// is indented, never the content). The hand-backfilled entries we must keep
// byte-for-byte use 2-space hanging indents on wrapped bullet lines, which
// that step would mangle. Writing/printing the bytes directly here and
// exiting before compileTemplate's own write step runs is the only way to
// avoid that corruption without changing the release command itself.

const fs = require('node:fs')
const path = require('node:path')
const { REPO_ROOT, getPostTagCommits } = require('../scripts/changelog-shared')

function renderSection(title, href, commits, getCommitLink) {
  const heading = href ? `## [${title}](${href})` : `## [${title}]`
  if (commits.length === 0) {
    return [heading, '', '_No changes since the latest tag._'].join('\n')
  }
  const bullets = commits.map(commit => {
    const shortHash = commit.hash.slice(0, 7)
    return `- ${commit.subject} [\`${shortHash}\`](${getCommitLink(commit.hash)})`
  })
  return [heading, '', '### Commits', '', ...bullets].join('\n')
}

module.exports = function setup(Handlebars) {
  Handlebars.registerHelper('renderChangelog', function () {
    const { options, releases } = this
    const latest = releases[0]
    const { tag, commits } = getPostTagCommits()
    const section = renderSection(latest.title, latest.href, commits, options.getCommitLink)

    if (options.unreleased) {
      // Release notes (-u --unreleased, no -p/--latest-version): only the
      // post-tag commits.
      process.stdout.write(`${section}\n`)
      process.exit(0)
    }

    if (!options.latestVersion) {
      throw new Error(
        'auto-changelog must be run either with -u/--unreleased (release notes) ' +
        'or with -p/--latest-version (after:bump, or its --stdout dry run) — ' +
        'see CLAUDE.md "Release" for the exact supported command forms.'
      )
    }

    // after:bump (-p), or a --latest-version dry run: keep CHANGELOG.md
    // byte-for-byte, inserting the new section immediately above the latest
    // tag's own heading.
    const changelogPath = path.join(REPO_ROOT, options.output || 'CHANGELOG.md')
    const existing = fs.readFileSync(changelogPath, 'utf8')
    const heading = `## [${tag}]`
    const index = existing.indexOf(heading)
    if (index === -1) {
      throw new Error(`CHANGELOG.md has no '${heading}' heading to insert above`)
    }
    const full = `${existing.slice(0, index)}${section}\n\n${existing.slice(index)}`

    if (options.stdout) {
      process.stdout.write(full)
    } else {
      fs.writeFileSync(changelogPath, full)
    }
    process.exit(0)
  })
}
