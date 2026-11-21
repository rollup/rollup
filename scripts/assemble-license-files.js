#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	classifyLicenseText,
	compareStrings,
	getTextId,
	hasConcreteCopyrightNotice,
	normalizeText,
	parseLicenseIds
} from './license-texts.js';

const REPOSITORY_ROOT = fileURLToPath(new URL('..', import.meta.url));
const SEPARATOR = '---------------------------------------';

const ARTIFACTS = [
	{
		outputFile: 'LICENSE.md',
		sections: [
			{
				fragments: [{ file: 'licenses/javascript-node.json' }],
				title: 'Bundled JavaScript dependencies'
			},
			{
				fragments: [
					{ file: 'licenses/rust.json', key: 'native' },
					{ file: 'licenses/rust.json', key: 'wasm' }
				],
				title: 'Bundled Rust dependencies'
			}
		]
	},
	{
		outputFile: 'browser/LICENSE.md',
		sections: [
			{
				fragments: [{ file: 'licenses/javascript-browser.json' }],
				title: 'Bundled JavaScript dependencies'
			},
			{
				fragments: [{ file: 'licenses/rust.json', key: 'wasm' }],
				title: 'Bundled Rust dependencies'
			}
		]
	}
];

/**
 * A license text is printed once at the end if it is a recognized license text
 * that does not name a copyright holder; everything else stays with the package
 * that ships it, so that notices keep their attribution.
 *
 * @typedef {{ authors?: string[]; license: string | null; name: string; repository: string | null; texts: string[] }} FragmentPackage
 * @typedef {{ packages: FragmentPackage[]; texts: Record<string, string> }} Fragment
 * @typedef {{ packages: FragmentPackage[]; texts: Map<string, string>; title: string }} Section
 * @typedef {{ package: FragmentPackage; section: Section }} PackageRecord
 * @typedef {{ hoisted: boolean; label: string | null; licenseId: string | null; owner: PackageRecord | null; text: string }} TextInfo
 */

/**
 * @param {{ file: string; key?: string }} reference
 * @return {Promise<Fragment>}
 */
async function readFragment({ file, key }) {
	let content;
	try {
		content = JSON.parse(await readFile(path.join(REPOSITORY_ROOT, file), 'utf8'));
	} catch (error) {
		throw new Error(
			`Cannot read license fragment ${file}. Generate it with "npm run build:js" (JavaScript) or "npm run build:rust-licenses" (Rust).`,
			{ cause: error }
		);
	}
	if (!key) return content;
	if (!(key in content)) {
		throw new Error(`Fragment ${file} has no "${key}" section. Run "npm run build:rust-licenses".`);
	}
	return content[key];
}

/**
 * Fragments store texts as they were found; normalization, deduplication and
 * text ids happen here so that all writers of fragments stay simple.
 *
 * @param {readonly Fragment[]} fragments
 * @return {{ packages: FragmentPackage[]; texts: Map<string, string> }}
 */
function mergeFragments(fragments) {
	const packages = new Map();
	const texts = new Map();
	for (const fragment of fragments) {
		const textIds = new Map();
		for (const [fragmentTextId, rawText] of Object.entries(fragment.texts)) {
			const text = normalizeText(rawText);
			if (!text) continue;
			const textId = getTextId(text);
			textIds.set(fragmentTextId, textId);
			texts.set(textId, text);
		}
		for (const fragmentPackage of fragment.packages) {
			const packageTexts = [
				...new Set(
					fragmentPackage.texts.map(fragmentTextId => {
						const textId = textIds.get(fragmentTextId);
						if (!textId) {
							throw new Error(`Unknown license text ${fragmentTextId} for ${fragmentPackage.name}`);
						}
						return textId;
					})
				)
			];
			const knownPackage = packages.get(fragmentPackage.name);
			if (knownPackage) {
				for (const textId of packageTexts) {
					if (!knownPackage.texts.includes(textId)) knownPackage.texts.push(textId);
				}
				continue;
			}
			packages.set(fragmentPackage.name, { ...fragmentPackage, texts: packageTexts });
		}
	}
	return { packages: [...packages.values()], texts };
}

/**
 * @param {string} text
 * @return {string}
 */
function quote(text) {
	return text
		.split('\n')
		.map(line => `> ${line}`)
		.join('\n');
}

/**
 * @param {PackageRecord} record
 * @param {Map<string, TextInfo>} textInfos
 * @return {string}
 */
function renderPackageBlock(record, textInfos) {
	const { package: fragmentPackage } = record;
	const lines = [`## ${fragmentPackage.name}`];
	if (fragmentPackage.license) lines.push(`License: ${fragmentPackage.license}`);
	if (fragmentPackage.authors?.length) lines.push(`By: ${fragmentPackage.authors.join(', ')}`);
	if (fragmentPackage.repository) lines.push(`Repository: ${fragmentPackage.repository}`);
	const references = [];
	const inlineTexts = [];
	for (const textId of fragmentPackage.texts) {
		const textInfo = textInfos.get(textId);
		if (!textInfo) throw new Error(`Unknown license text ${textId} for ${fragmentPackage.name}`);
		if (textInfo.hoisted) {
			references.push(`see ${textInfo.label} below`);
		} else if (textInfo.owner === record) {
			inlineTexts.push(textInfo.text);
		} else if (textInfo.owner) {
			const licenseId = textInfo.licenseId ? `${textInfo.licenseId} ` : '';
			references.push(`${licenseId}same as ${textInfo.owner.package.name}`);
		}
	}
	if (references.length > 0) lines.push(`License text: ${references.join(', ')}`);
	for (const text of inlineTexts) lines.push('', quote(text));
	return lines.join('\n');
}

/**
 * @param {Section[]} sections
 * @param {string} coreLicenseText
 * @return {string}
 */
function renderLicenseFile(sections, coreLicenseText) {
	/** @type {PackageRecord[]} */
	const records = [];
	for (const section of sections) {
		for (const fragmentPackage of [...section.packages].sort((packageA, packageB) =>
			compareStrings(packageA.name, packageB.name)
		)) {
			records.push({ package: fragmentPackage, section });
		}
	}

	/** @type {Map<string, TextInfo>} */
	const textInfos = new Map();
	for (const record of records) {
		for (const textId of record.package.texts) {
			let textInfo = textInfos.get(textId);
			if (!textInfo) {
				const text = record.section.texts.get(textId);
				if (text === undefined) {
					throw new Error(`Unknown license text ${textId} for ${record.package.name}`);
				}
				const licenseId = classifyLicenseText(text);
				textInfo = {
					hoisted: licenseId !== null && !hasConcreteCopyrightNotice(text),
					label: null,
					licenseId,
					owner: null,
					text
				};
				textInfos.set(textId, textInfo);
			}
			if (!textInfo.owner) textInfo.owner = record;
		}
	}

	const hoistedTextInfos = [...textInfos.values()].filter(textInfo => textInfo.hoisted);
	hoistedTextInfos.sort((textInfoA, textInfoB) =>
		compareStrings(textInfoA.licenseId ?? '', textInfoB.licenseId ?? '')
	);
	const hoistedCounts = new Map();
	for (const textInfo of hoistedTextInfos) {
		const licenseId = textInfo.licenseId ?? '';
		hoistedCounts.set(licenseId, (hoistedCounts.get(licenseId) ?? 0) + 1);
	}
	const assignedHoistedCounts = new Map();
	for (const textInfo of hoistedTextInfos) {
		const licenseId = textInfo.licenseId ?? '';
		const count = (assignedHoistedCounts.get(licenseId) ?? 0) + 1;
		assignedHoistedCounts.set(licenseId, count);
		textInfo.label = hoistedCounts.get(licenseId) === 1 ? licenseId : `${licenseId} (${count})`;
	}

	const licenseIds = new Set();
	for (const { package: fragmentPackage } of records) {
		for (const licenseId of parseLicenseIds(fragmentPackage.license)) licenseIds.add(licenseId);
	}

	const parts = [
		`# Rollup core license\nRollup is released under the MIT license:\n\n${coreLicenseText}`,
		'# Licenses of bundled dependencies\n' +
			'The published Rollup artifact additionally contains code with the following licenses:\n' +
			[...licenseIds].sort(compareStrings).join(', ')
	];
	for (const section of sections) {
		const sectionRecords = records.filter(record => record.section === section);
		if (sectionRecords.length === 0) continue;
		parts.push(
			`# ${section.title}\n` +
				sectionRecords
					.map(record => renderPackageBlock(record, textInfos))
					.join(`\n\n${SEPARATOR}\n\n`)
		);
	}
	if (hoistedTextInfos.length > 0) {
		parts.push(
			`# License texts\n` +
				hoistedTextInfos
					.map(textInfo => `## ${textInfo.label}\n\n${quote(textInfo.text)}`)
					.join(`\n\n${SEPARATOR}\n\n`)
		);
	}
	return `${parts.join('\n\n')}\n`;
}

async function main() {
	const coreLicenseText = normalizeText(
		await readFile(path.join(REPOSITORY_ROOT, 'LICENSE-CORE.md'), 'utf8')
	);
	await Promise.all(
		ARTIFACTS.map(async ({ outputFile, sections }) => {
			const resolvedSections = [];
			for (const section of sections) {
				const fragments = [];
				for (const reference of section.fragments) {
					fragments.push(await readFragment(reference));
				}
				resolvedSections.push({
					...mergeFragments(fragments),
					title: section.title
				});
			}
			const content = renderLicenseFile(resolvedSections, coreLicenseText);
			const outputPath = path.join(REPOSITORY_ROOT, outputFile);
			const previousContent = await readFile(outputPath, 'utf8').catch(() => '');
			if (previousContent !== content) {
				await writeFile(outputPath, content);
				console.warn(`${outputFile} updated. You should commit the updated file.`);
			}
		})
	);
}

await main();
