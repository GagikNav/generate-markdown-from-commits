import simpleGit from 'simple-git'
import fs from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import process from 'process'
import * as exec from '@actions/exec'
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
async function run() {
	let output = ''
	let error = ''
	const options = {
		listeners: {
			stdout: (data: Buffer) => {
				output += data.toString()
			},
			stderr: (data: Buffer) => {
				error += data.toString()
			},
		},
	}

	await exec.exec(
		'git',
		['log', `--pretty=format:%H %aI %s %D %b %aN %aE`, `${defaultBranch}...${currentBranch}`],
		options
	)

	if (error) {
		console.error(error)
		return
	}

	const log = output.split('\n').map((line) => {
		const [hash, date, message, refNames, body, authorName, authorEmail] = line.split(' ')
		return { hash, date, message, refNames, body, authorName, authorEmail }
	})
	// Process commits and generate Markdown
	changelog = generateChangelog(log)
}
run()
// Set the CHANGELOG environment variable
core.exportVariable('CHANGELOG', changelog)
