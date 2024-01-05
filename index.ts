import simpleGit from 'simple-git'
import fs from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import process from 'process'
import { generateChangelog } from './generateChangelog'

const repoPath = './' // Replace with the path to your Git repository

// Get the current branch from the GITHUB_REF environment variable
let currentBranch = process.env.GITHUB_REF

// Get the default branch from the github context
let defaultBranch: string = github.context.payload.repository?.default_branch
console.log('Default branch is: ' + defaultBranch)

let changelog: string = ''

// Check if the current branch exists
if (currentBranch) {
	console.log('Current branch is: ' + currentBranch)
	currentBranch = currentBranch.replace('refs/heads/', '')
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

// @ts-ignore
const git = simpleGit(repoPath)

git.log({ from: defaultBranch, to: currentBranch }, (err, log) => {
	if (err) {
		console.error(err)
		return
	}
	const commits = log.all
	// Process commits and generate Markdown
	changelog = generateChangelog(commits)
})

// Set the CHANGELOG environment variable
core.exportVariable('CHANGELOG', changelog)
