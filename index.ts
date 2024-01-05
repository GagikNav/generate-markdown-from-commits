import simpleGit from 'simple-git'

import * as core from '@actions/core'
import * as github from '@actions/github'
import process from 'process'
import * as exec from '@actions/exec'
import { generateChangelog } from './generateChangelog'



// Get the current branch from the GITHUB_REF environment variable
let currentBranch = process.env.GITHUB_REF
// let currentBranch = 'test'

// Get the default branch from the github context
let defaultBranch: string = github.context.payload.repository?.default_branch
// let defaultBranch: string = 'main'
console.log('Default branch is: ' + defaultBranch)

let changelog: string = ''

// Check if the current branch exists
if (currentBranch) {
	currentBranch = currentBranch.replace('refs/heads/', '')
	console.log('Current branch is: ' + currentBranch)
} else {
	core.setFailed('Could not determine the current branch')
}

if (!defaultBranch) {
	core.setFailed('Could not determine the default branch')
}



// Get the default branch from the github context
if (!defaultBranch) {
	core.setFailed('Could not determine the default branch')
}


async function run() {
	const git = simpleGit();
	const log = await git.log({
			from: defaultBranch,
			to: currentBranch,
			splitOn: '..', // Split on two dots
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
