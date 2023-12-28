const simpleGit = require('simple-git')
const fs = require('fs')
const parser = require('conventional-commits-parser')

const repoPath = './' // Replace with the path to your Git repository

// Check if the repository exists
if (!fs.existsSync(repoPath)) {
  console.error('The specified repository does not exist.')
  process.exit(1)
}
const git = simpleGit(repoPath)
git.log({ from: 'dev', to: 'updating-documents' }, (err, log) => {
  if (err) {
    console.error(err)
    return
  }

  const commits = log.all
  // Process commits and generate Markdown
  const changelog = generateChangelog(commits)
  fs.writeFileSync('CHANGELOG.md', changelog)
})
function generateChangelog(commits) {
  // Parse commits using conventional-commits-parser
  const parsedCommits = commits.map((commit) => parser.sync(commit.message))

  // Organize commits by type in an object
  const organizedCommits = parsedCommits.reduce(
    (accumulator, currentValue, index, commitsArr) => {
      accumulator = {
        ...accumulator,
        [currentValue.type]: commitsArr.filter((commit) => commit.type === currentValue.type),
      }
      return accumulator
    },

    {},
  )
  // Generate Markdown for each commit type
  const commitTypes = Object.keys(organizedCommits)
  
  // sorting commitTypes the way that null is last one
  commitTypes.sort((a, b) => {
    if (a === 'null') {
      return 1
    } else if (b === 'null') {
      return -1
    } else {
      return 0
    }
  })

  commitTypes.forEach((type) => {
    organizedCommits[type] = organizedCommits[type].map((commit) => {
      return `- ${type === 'null' ? commit.header : commit.subject} ${
        commit?.scope ? `(${commit.scope})` : ''
      } `
    })
  })

  const typesMap = {
    feat: 'Features',
    fix: 'Bug Fixes',
    docs: 'Documentation',
    style: 'Styles',
    refactor: 'Code Refactoring',
    perf: 'Performance Improvements',
    test: 'Tests',
    build: 'Build System',
    ci: 'Continuous Integration',
    chore: 'Chores',
    revert: 'Reverts',
    null: 'Other',
  }

  let changelog = ''
  commitTypes.forEach((type) => {
    changelog += `### ${typesMap[type] ?? type}\n`
    changelog += `${organizedCommits[type].join('\n')}\n\n`
  })

  return `## Changelog\n\n${changelog}`
}
