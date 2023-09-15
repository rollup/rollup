#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chdir } from 'node:process';
import { fileURLToPath } from 'node:url';
import { readJson, runWithEcho } from './helpers.js';
import publishWasmNodePackage from './publish-wasm-node-package.js';
import { CHANGELOG, MAIN_PACKAGE } from './release-constants.js';
import { getCurrentCommitMessage, getFirstChangelogEntry } from './release-helpers.js';

// We execute everything from the main directory
chdir(fileURLToPath(new URL('..', import.meta.url)));

const version = await getCurrentCommitMessage();
const matched = /^\d+\.\d+\.\d+(-\d+)?$/.exec(version);

if (!matched) {
	throw new Error(
		`The commit message "${version}" does not satisfy the patterns 0.0.0 or 0.0.0-0.`
	);
}
const isPreRelease = !!matched[1];
await verifyChangelog(isPreRelease);

await runWithEcho('npm', ['publish'], { cwd: resolve('browser') });
await publishWasmNodePackage();

const { optionalDependencies } = await readJson(MAIN_PACKAGE);
await runWithEcho('npm', ['run', 'prepublish:napi']);
const mainPackage = await readJson(MAIN_PACKAGE);
await writeFile(
	MAIN_PACKAGE,
	JSON.stringify(
		{
			...mainPackage,
			optionalDependencies: { ...optionalDependencies, ...mainPackage.optionalDependencies }
		},
		null,
		2
	)
);

/**
 * @param {boolean} isPreRelease
 * @return {Promise<void>}
 */
async function verifyChangelog(isPreRelease) {
	const changelog = await readFile(CHANGELOG, 'utf8');
	const { currentVersion, text } = getFirstChangelogEntry(changelog);
	if (currentVersion !== version) {
		if (isPreRelease) {
			console.log(
				`There is no changelog entry for version "${version}", the last entry is for version "${currentVersion}". This is OK for a pre-release.`
			);
			return;
		}
		throw new Error(
			`There is no changelog entry for version "${version}", the last entry is for version "${currentVersion}".`
		);
	}
	if (text.includes('[replace me]')) {
		throw new Error(`The changelog entry must not contain placeholders. The text was:\n${text}`);
	}
}
