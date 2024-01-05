import simpleGit from 'simple-git'
import fs from 'fs'
import * as core from '@actions/core'

import process from 'process'
import * as exec from '@actions/exec'
import { generateChangelog } from './generateChangelog'

const repoPath = './' // Replace with the path to your Git repository

// Get the current branch from the GITHUB_REF environment variable
// let currentBranch = process.env.GITHUB_REF
let currentBranch = 'test'

// Get the default branch from the github context
// let defaultBranch: string = github.context.payload.repository?.default_branch
let defaultBranch: string = 'main'
console.log('Default branch is: ' + defaultBranch)

let changelog: string = ''

// Check if the current branch exists
if (currentBranch) {
	// currentBranch = currentBranch.replace('refs/heads/', '')
	currentBranch = 'test'
	console.log('Current branch is: ' + currentBranch)
} else {
	core.setFailed('Could not determine the current branch')
}

if (!defaultBranch) {
	core.setFailed('Could not determine the default branch')
}

// Check if the repository exists
if (!fs.existsSync(repoPath)) {
	core.setFailed('Repository does not exist')
}

// Get the default branch from the github context
if (!defaultBranch) {
	core.setFailed('Could not determine the default branch')
}

// Check if the repository exists
if (!fs.existsSync(repoPath)) {
	console.error('The specified repository does not exist.')
	process.exit(1)
}
async function run() {
	const git = simpleGit();
	const log = await git.log({
			from: defaultBranch,
			to: currentBranch,
			format: {
					hash: '%H',
					date: '%aI',
					message: '%s',
					refNames: '%D',
					body: '%b',
					authorName: '%aN',
					authorEmail: '%aE'
			}
	});

	// Process commits and generate Markdown
	changelog = generateChangelog(log.all);
	console.log(changelog)
}
run()
// Set the CHANGELOG environment variable
core.exportVariable('CHANGELOG', changelog)
