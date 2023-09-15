import { readFile } from 'node:fs/promises';
import { argv } from 'node:process';
import { CHANGELOG } from './release-constants.js';
import { getFirstChangelogEntry } from './release-helpers.js';

console.log(
	`-----------------------------------------------------------------------
This script will ensure a proper changelog entry has been created for a
release.
-----------------------------------------------------------------------`
);

let version = argv[2];

if (!version) {
	throw new Error('No version was passed to "verify-changelog".');
}

if (version.startsWith('v')) {
	version = version.slice(1);
}

const matched = /^\d+\.\d+\.\d+(-\d)?$/.exec(version);
if (!matched) {
	throw new Error(
		`The version ${JSON.stringify(
			version
		)} passed to "verifyChangelog" does not satisfy the patterns 0.0.0 or 0.0.0-0`
	);
}
const isPreRelease = !!matched[1];

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
