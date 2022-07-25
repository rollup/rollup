#!/usr/bin/env node

// git pull --ff-only && npm ci && npm run lint:nofix && npm audit && npm run build:bootstrap && npm run test:all

import fs from 'fs-extra';
import inquirer from 'inquirer';
import semverInc from 'semver/functions/inc.js';
import semverPreRelease from 'semver/functions/prerelease.js';
import { runAndGetStdout } from './helpers.js';

const MAIN_BRANCH = 'master';
const MAIN_INCREMENTS = ['patch', 'minor'];
const BRANCH_INCREMENTS = ['premajor', 'preminor', 'prepatch'];
const PRE_RELEASE_INCREMENTS = ['prerelease'];

// TODO Lukas enable
// await runWithEcho('git', ['pull', '--ff-only']);

const [pkg, currentBranch] = await Promise.all([
	fs.readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
	runAndGetStdout('git', ['branch', '--show-current'])
]);
const { version } = pkg;
const isPreRelease = !!semverPreRelease(version);
const isMainBranch = currentBranch === MAIN_BRANCH;

const availableIncrements = isMainBranch
	? MAIN_INCREMENTS
	: isPreRelease
	? PRE_RELEASE_INCREMENTS
	: BRANCH_INCREMENTS;

const { newVersion } = await inquirer.prompt([
	{
		choices: availableIncrements.map(increment => {
			const value = semverInc(version, increment);
			return {
				name: `${increment} (${value})`,
				short: increment,
				value
			};
		}),
		message: `Select type of release (currently "${version}" on branch "${currentBranch}"):`,
		name: 'newVersion',
		type: 'list'
	}
]);

// TODO Lukas enable
// await Promise.all([runWithEcho('npm', ['ci']), runWithEcho('npm', ['audit'])]);
// await Promise.all([
// 	runWithEcho('npm', ['run', 'lint:nofix']),
// 	runWithEcho('npm', ['run', 'build:bootstrap'])
// ]);
// await runWithEcho('npm', ['run', 'test:all']);
