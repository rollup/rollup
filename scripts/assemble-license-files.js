#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	classifyLicenseText,
	compareStrings,
	getTextId,
	isCopyrightNotice,
	normalizeText,
	parseLicenseIds,
	splitLicenseText
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
 * License texts are split into the notices of the package that ships them and a
 * reusable body. Bodies of recognized license texts are printed once at the end
 * of the file, so the same license text is never repeated for each dependency.
 *
 * @typedef {{ authors?: string[]; license: string | null; name: string; repository: string | null; texts: string[] }} FragmentPackage
 * @typedef {{ packages: FragmentPackage[]; texts: Record<string, string> }} Fragment
 * @typedef {{ packages: FragmentPackage[]; texts: Map<string, string>; title: string }} Section
 * @typedef {{ package: FragmentPackage; section: Section }} PackageRecord
 * @typedef {{ attribution: string[]; bodyKey: string | null }} TextInfo
 * @typedef {{ body: string; label: string | null; licenseId: string | null }} BodyInfo
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
 * @param {string} body
 * @return {string}
 */
function getBodyKey(body) {
	return body.replaceAll(/\s+/g, '');
}

/**
 * @param {readonly PackageRecord[]} records
 * @return {{ bodies: Map<string, BodyInfo>; textInfos: Map<string, TextInfo> }}
 */
function indexLicenseTexts(records) {
	/** @type {Map<string, TextInfo>} */
	const textInfos = new Map();
	/** @type {Map<string, BodyInfo>} */
	const bodies = new Map();
	for (const record of records) {
		for (const textId of record.package.texts) {
			let textInfo = textInfos.get(textId);
			if (!textInfo) {
				const text = record.section.texts.get(textId);
				if (text === undefined) {
					throw new Error(`Unknown license text ${textId} for ${record.package.name}`);
				}
				const { attribution, body } = splitLicenseText(text);
				const bodyKey = body ? getBodyKey(body) : null;
				textInfo = { attribution, bodyKey };
				textInfos.set(textId, textInfo);
				if (body && bodyKey && !bodies.has(bodyKey)) {
					const licenseId = classifyLicenseText(body);
					bodies.set(bodyKey, { body, label: null, licenseId });
				}
			}
		}
	}
	assignBodyLabels(bodies);
	return { bodies, textInfos };
}

/**
 * @param {Map<string, BodyInfo>} bodies
 * @return {void}
 */
function assignBodyLabels(bodies) {
	const hoistedBodies = getSortedHoistedBodies(bodies);
	const bodyCounts = new Map();
	for (const bodyInfo of hoistedBodies) {
		const licenseId = bodyInfo.licenseId ?? '';
		bodyCounts.set(licenseId, (bodyCounts.get(licenseId) ?? 0) + 1);
	}
	const assignedCounts = new Map();
	for (const bodyInfo of hoistedBodies) {
		const licenseId = bodyInfo.licenseId ?? '';
		const count = (assignedCounts.get(licenseId) ?? 0) + 1;
		assignedCounts.set(licenseId, count);
		bodyInfo.label = bodyCounts.get(licenseId) === 1 ? licenseId : `${licenseId} (${count})`;
	}
}

/**
 * @param {Map<string, BodyInfo>} bodies
 * @return {BodyInfo[]}
 */
function getSortedHoistedBodies(bodies) {
	return [...bodies.values()]
		.filter(bodyInfo => bodyInfo.licenseId !== null)
		.sort(
			(bodyInfoA, bodyInfoB) =>
				compareStrings(bodyInfoA.licenseId ?? '', bodyInfoB.licenseId ?? '') ||
				compareStrings(bodyInfoA.body, bodyInfoB.body)
		);
}

/**
 * A package that declares an "A AND B" license but ships only one of the texts is
 * legal to publish, but almost always a packaging mistake.
 *
 * @param {readonly PackageRecord[]} records
 * @param {Map<string, TextInfo>} textInfos
 * @param {Map<string, BodyInfo>} bodies
 * @return {void}
 */
function warnAboutUncoveredLicenseIds(records, textInfos, bodies) {
	for (const { package: fragmentPackage } of records) {
		const ownLicenseIds = new Set();
		for (const textId of fragmentPackage.texts) {
			const bodyKey = textInfos.get(textId)?.bodyKey;
			const licenseId = bodyKey ? bodies.get(bodyKey)?.licenseId : null;
			if (licenseId) ownLicenseIds.add(licenseId);
		}
		if (ownLicenseIds.size === 0) continue;
		for (const conjunct of (fragmentPackage.license ?? '').split(/\s+AND\s+/)) {
			const alternativeLicenseIds = parseLicenseIds(conjunct).filter(
				licenseId => !licenseId.includes(' WITH ')
			);
			if (alternativeLicenseIds.length === 0) continue;
			if (alternativeLicenseIds.some(licenseId => ownLicenseIds.has(licenseId))) continue;
			console.warn(
				`${fragmentPackage.name} declares "${fragmentPackage.license}" but ships no text for ${conjunct.trim()}.`
			);
		}
	}
}

/**
 * @param {PackageRecord} record
 * @param {Map<string, TextInfo>} textInfos
 * @param {Map<string, BodyInfo>} bodies
 * @return {string}
 */
function renderPackageBlock(record, textInfos, bodies) {
	const { package: fragmentPackage } = record;
	const lines = [`## ${fragmentPackage.name}`];
	if (fragmentPackage.license) lines.push(`License: ${fragmentPackage.license}`);
	if (fragmentPackage.authors?.length) lines.push(`By: ${fragmentPackage.authors.join(', ')}`);
	if (fragmentPackage.repository) lines.push(`Repository: ${fragmentPackage.repository}`);
	const references = [];
	const inlineTexts = [];
	const attribution = [];
	for (const textId of fragmentPackage.texts) {
		const textInfo = textInfos.get(textId);
		if (!textInfo) throw new Error(`Unknown license text ${textId} for ${fragmentPackage.name}`);
		for (const line of textInfo.attribution) attribution.push(line);
		if (!textInfo.bodyKey) continue;
		const bodyInfo = bodies.get(textInfo.bodyKey);
		if (!bodyInfo) throw new Error(`Unknown license text body for ${fragmentPackage.name}`);
		if (bodyInfo.licenseId) {
			references.push(`see ${bodyInfo.label} below`);
		} else {
			inlineTexts.push(bodyInfo.body);
		}
	}
	if (references.length > 0) lines.push(`License text: ${references.join(', ')}`);
	const attributionLines = [...new Set(attribution)].sort(
		(lineA, lineB) => Number(isCopyrightNotice(lineB)) - Number(isCopyrightNotice(lineA))
	);
	if (attributionLines.length > 0) lines.push('', quote(attributionLines.join('\n')));
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

	const { bodies, textInfos } = indexLicenseTexts(records);
	warnAboutUncoveredLicenseIds(records, textInfos, bodies);

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
					.map(record => renderPackageBlock(record, textInfos, bodies))
					.join(`\n\n${SEPARATOR}\n\n`)
		);
	}
	const hoistedBodies = getSortedHoistedBodies(bodies);
	if (hoistedBodies.length > 0) {
		parts.push(
			`# License texts\n` +
				hoistedBodies
					.map(bodyInfo => `## ${bodyInfo.label}\n\n${quote(bodyInfo.body)}`)
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
