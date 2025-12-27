import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';

const [optionsText, helpText] = await Promise.all([
	readFile(new URL('../docs/configuration-options/index.md', import.meta.url), 'utf8'),
	readFile(new URL('../cli/help.md', import.meta.url), 'utf8')
]);

const optionSections = optionsText.split('\n## ');
let searchedOptions = '';
for (const section of optionSections.slice(1)) {
	if (!(section.startsWith('Experimental') || section.startsWith('Deprecated'))) {
		searchedOptions += section;
	}
}

const findCliOptionRegExp = /CLI: (`(-(\w)[^`]*)`\/)?`(--([\w.]+)[^`]*)`/g;

const allCliOptions = [];
let match;

while ((match = findCliOptionRegExp.exec(searchedOptions)) !== null) {
	allCliOptions.push({ long: match[5], short: match[3] });
}

const findOptionInHelpRegExp = /^(-(\w), )?--(no-)?([\w.]+)/gm;

const cliOptionsInHelp = new Map();

while ((match = findOptionInHelpRegExp.exec(helpText)) !== null) {
	cliOptionsInHelp.set(match[4], match[2]);
}

let failed = false;

for (const { long, short } of allCliOptions) {
	if (!cliOptionsInHelp.has(long)) {
		failed = true;
		console.error(`Could find neither --${long} nor --no-${long} in help.md.`);
	}
	const optionInHelp = cliOptionsInHelp.get(long);
	if (short !== optionInHelp) {
		failed = true;
		console.error(
			`Inconsistent option with shortcut. Expected -${short}/--${long}, got -${optionInHelp.short}/--${optionInHelp.long}.`
		);
	}
}

if (failed) {
	exit(1);
}

let current = null;
for (const [long, short] of cliOptionsInHelp) {
	if (!short) {
		if (current && long < current) {
			console.error(
				`Options in help.md are not sorted properly. "${long}" should occur before "${current}".`
			);
			exit(1);
		}
		current = long;
	}
}

const splitHelpText = helpText.split('\n');
for (const line of splitHelpText) {
	if (line.length > 80) {
		console.error(`The following line in help.md exceeds the limit of 80 characters:\n${line}`);
		exit(1);
	}
}
