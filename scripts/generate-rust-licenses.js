#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import {
	classifyLicenseText,
	compareStrings,
	getTextId,
	normalizeText,
	parseLicenseIds
} from './license-texts.js';

const execFileAsync = promisify(execFile);

const REPOSITORY_ROOT = fileURLToPath(new URL('..', import.meta.url));
const RUST_DIRECTORY = path.join(REPOSITORY_ROOT, 'rust');
const OUTPUT_FILE = path.join(REPOSITORY_ROOT, 'licenses', 'rust.json');
const OVERRIDES_DIRECTORY = path.join(RUST_DIRECTORY, 'license-overrides');
const CANONICAL_DIRECTORY = path.join(RUST_DIRECTORY, 'license-canonical');

const NATIVE_PACKAGE = 'bindings_napi';
const WASM_PACKAGE = 'bindings_wasm';
const WASM_TARGET = 'wasm32-unknown-unknown';

const LICENSE_FILE_NAME = /^(licen[cs]e|copying|copyright|unlicense|notice)/i;

const ADDITIONAL_LICENSE_PATHS = new Map([['libmimalloc-sys2', ['c_src/mimalloc/LICENSE']]]);

/**
 * The standard library is linked into every artifact but is not a crate in the
 * dependency graph. This entry approximates its licensing with the Rust project
 * license; the standard library's own dependencies and compiler-builtins carry
 * their own copyright holders and are not covered.
 */
const STANDARD_LIBRARY = {
	authors: ['The Rust Project Developers'],
	directory: path.join(RUST_DIRECTORY, 'license-std'),
	license: 'MIT OR Apache-2.0',
	name: 'rust-std',
	repository: 'https://github.com/rust-lang/rust'
};

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   version: string;
 *   license: string | null;
 *   license_file: string | null;
 *   repository: string | null;
 *   authors: string[];
 *   manifest_path: string;
 * }} CargoPackage
 * @typedef {{ packages: CargoPackage[]; workspace_members: string[] }} CargoMetadata
 * @typedef {{ authors: string[]; license: string | null; name: string; repository: string | null; texts: string[] }} FragmentPackage
 * @typedef {{ packages: FragmentPackage[]; texts: Record<string, string> }} Fragment
 * @typedef {{ id: string; text: string }} LicenseText
 */

/**
 * @param {string[]} parameters
 * @return {Promise<string>}
 */
async function runCargo(parameters) {
	const { stdout } = await execFileAsync('cargo', parameters, {
		cwd: RUST_DIRECTORY,
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024
	});
	return stdout;
}

/**
 * @param {string[]} authors
 * @return {string[]}
 */
function collectAuthorNames(authors) {
	const names = new Set();
	for (const author of authors) {
		const name = author
			.replace(/<[^>]*>/g, '')
			.replaceAll(/\s+/g, ' ')
			.trim();
		if (name) names.add(name);
	}
	return [...names];
}

/**
 * @param {string} directory
 * @param {{ optional?: boolean }} [options]
 * @return {Promise<string[]>}
 */
async function findLicenseFiles(directory, { optional = false } = {}) {
	let entries;
	try {
		entries = await readdir(directory, { withFileTypes: true });
	} catch (error) {
		if (optional && /** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT') return [];
		throw error;
	}
	return entries
		.filter(entry => entry.isFile() && LICENSE_FILE_NAME.test(entry.name))
		.map(entry => entry.name)
		.sort(compareStrings)
		.map(name => path.join(directory, name));
}

/**
 * @param {string[]} files
 * @return {Promise<LicenseText[]>}
 */
async function readLicenseTexts(files) {
	const texts = [];
	const seenTextIds = new Set();
	for (const file of files) {
		const text = (await readFile(file, 'utf8')).trim();
		if (!text) continue;
		const id = getTextId(text);
		if (seenTextIds.has(id)) continue;
		seenTextIds.add(id);
		texts.push({ id, text });
	}
	return texts;
}

/**
 * @param {string} licenseId
 * @return {Promise<LicenseText[]>}
 */
async function readCanonicalLicenseTexts(licenseId) {
	return readLicenseTexts([path.join(CANONICAL_DIRECTORY, `${licenseId.toLowerCase()}.txt`)]).catch(
		() => []
	);
}

/**
 * @param {CargoPackage} cargoPackage
 * @return {Promise<LicenseText[]>}
 */
async function resolveCrateLicenseTexts(cargoPackage) {
	const directory = path.dirname(cargoPackage.manifest_path);
	const licenseFiles = await findLicenseFiles(directory);
	if (cargoPackage.license_file) {
		licenseFiles.push(path.join(directory, cargoPackage.license_file));
	}
	for (const additionalPath of ADDITIONAL_LICENSE_PATHS.get(cargoPackage.name) ?? []) {
		licenseFiles.push(path.join(directory, additionalPath));
	}
	const ownTexts = await readLicenseTexts(licenseFiles);
	if (ownTexts.length > 0) return ownTexts;

	const overrideTexts = await readLicenseTexts(
		await findLicenseFiles(path.join(OVERRIDES_DIRECTORY, cargoPackage.name), { optional: true })
	);
	if (overrideTexts.length > 0) return overrideTexts;

	const licenseIds = parseLicenseIds(cargoPackage.license);
	const canonicalTexts = [];
	for (const licenseId of licenseIds) {
		canonicalTexts.push(...(await readCanonicalLicenseTexts(licenseId)));
	}
	if (licenseIds.length > 0 && canonicalTexts.length === licenseIds.length) {
		return canonicalTexts;
	}

	throw new Error(
		`No license text found for ${cargoPackage.name}@${cargoPackage.version} ` +
			`(declared license: ${cargoPackage.license ?? 'none'}). ` +
			`Add the upstream text to rust/license-overrides/${cargoPackage.name}/ or rust/license-canonical/.`
	);
}

/**
 * Crates that are bundled with several versions only need to be attributed once.
 *
 * @param {CargoPackage[]} cargoPackages
 * @return {Map<string, CargoPackage[]>}
 */
function groupCargoPackagesByName(cargoPackages) {
	const packagesByName = new Map();
	for (const cargoPackage of cargoPackages) {
		const packages = packagesByName.get(cargoPackage.name);
		if (packages) {
			packages.push(cargoPackage);
		} else {
			packagesByName.set(cargoPackage.name, [cargoPackage]);
		}
	}
	return packagesByName;
}

/**
 * A crate may declare "X AND Y" while shipping only one of the texts. That is
 * legal to ship but almost always a packaging mistake, so surface it.
 *
 * @param {CargoPackage} cargoPackage
 * @param {LicenseText[]} licenseTexts
 */
function warnAboutUncoveredLicenseParts(cargoPackage, licenseTexts) {
	const expression = cargoPackage.license;
	if (!expression?.includes(' AND ')) return;
	const coveredLicenseIds = new Set(
		licenseTexts.map(({ text }) => classifyLicenseText(normalizeText(text))).filter(Boolean)
	);
	const uncoveredConjuncts = expression.split(/\s+AND\s+/).filter(conjunct => {
		const alternativeLicenseIds = parseLicenseIds(conjunct).filter(
			licenseId => !licenseId.includes(' WITH ')
		);
		return (
			alternativeLicenseIds.length > 0 &&
			!alternativeLicenseIds.some(licenseId => coveredLicenseIds.has(licenseId))
		);
	});
	if (uncoveredConjuncts.length === 0) return;
	console.warn(
		`${cargoPackage.name}@${cargoPackage.version} declares "${expression}" but ships no text for ` +
			`${uncoveredConjuncts.join(' AND ')}. Add a text to rust/license-overrides/${cargoPackage.name}/.`
	);
}

/**
 * @param {CargoMetadata} metadata
 * @return {Map<string, CargoPackage[]>}
 */
function indexPackages(metadata) {
	const packagesByIdentity = new Map();
	for (const cargoPackage of metadata.packages) {
		const identity = `${cargoPackage.name}@${cargoPackage.version}`;
		const packages = packagesByIdentity.get(identity);
		if (packages) {
			packages.push(cargoPackage);
		} else {
			packagesByIdentity.set(identity, [cargoPackage]);
		}
	}
	return packagesByIdentity;
}

/**
 * @param {CargoMetadata} metadata
 * @param {Map<string, CargoPackage[]>} packagesByIdentity
 * @param {string} packageName
 * @param {string | null} target
 * @return {Promise<CargoPackage[]>}
 */
async function readBundledCargoPackages(metadata, packagesByIdentity, packageName, target) {
	const parameters = [
		'tree',
		'--locked',
		'-e',
		'normal,no-proc-macro',
		'--prefix',
		'none',
		'--format',
		'{p}',
		'-p',
		packageName
	];
	if (target) parameters.push('--target', target);
	const workspaceMembers = new Set(metadata.workspace_members);
	const bundledPackages = new Map();
	for (const rawLine of (await runCargo(parameters)).split('\n')) {
		const line = rawLine.replace(/ \(\*\)$/, '').trim();
		if (!line) continue;
		const match = /^(?<name>\S+) v(?<version>\S+?)(?: \(|$)/.exec(line);
		if (!match) {
			throw new Error(`Cannot parse "cargo tree" output line: ${line}`);
		}
		const { name, version } = /** @type {{ name: string, version: string }} */ (match.groups);
		const candidates = packagesByIdentity.get(`${name}@${version}`) ?? [];
		const thirdPartyPackages = candidates.filter(({ id }) => !workspaceMembers.has(id));
		if (thirdPartyPackages.length === 0 && candidates.length > 0) continue;
		const cargoPackage = thirdPartyPackages[0];
		if (thirdPartyPackages.length !== 1 || !cargoPackage) {
			throw new Error(`Cannot uniquely resolve "${name}@${version}" from \`cargo tree\` output`);
		}
		bundledPackages.set(`${name}@${version}`, cargoPackage);
	}
	return [...bundledPackages.values()].sort(
		(packageA, packageB) =>
			compareStrings(packageA.name, packageB.name) ||
			compareStrings(packageA.version, packageB.version)
	);
}

/**
 * @param {CargoPackage[]} cargoPackages
 * @return {Promise<Fragment>}
 */
async function buildFragment(cargoPackages) {
	/** @type {FragmentPackage[]} */
	const packages = [];
	const texts = new Map();
	for (const [name, versions] of groupCargoPackagesByName(cargoPackages)) {
		/** @type {string[]} */
		const textIds = [];
		const authors = new Set();
		const declaredLicenses = new Set();
		for (const cargoPackage of versions) {
			const licenseTexts = await resolveCrateLicenseTexts(cargoPackage);
			warnAboutUncoveredLicenseParts(cargoPackage, licenseTexts);
			for (const author of collectAuthorNames(cargoPackage.authors)) authors.add(author);
			if (cargoPackage.license) declaredLicenses.add(cargoPackage.license);
			for (const { id, text } of licenseTexts) {
				texts.set(id, text);
				if (!textIds.includes(id)) textIds.push(id);
			}
		}
		packages.push({
			authors: [...authors],
			license:
				declaredLicenses.size === 1
					? [...declaredLicenses][0]
					: [...new Set(versions.flatMap(({ license }) => parseLicenseIds(license)))]
							.sort(compareStrings)
							.join(' OR '),
			name,
			repository: versions[0].repository,
			texts: textIds
		});
	}
	packages.push(await readStandardLibraryPackage(texts));
	packages.sort((packageA, packageB) => compareStrings(packageA.name, packageB.name));
	const sortedTexts = [...texts].sort(([idA], [idB]) => compareStrings(idA, idB));
	return { packages, texts: Object.fromEntries(sortedTexts) };
}

/**
 * @param {Map<string, string>} texts
 * @return {Promise<FragmentPackage>}
 */
async function readStandardLibraryPackage(texts) {
	const licenseTexts = await readLicenseTexts(await findLicenseFiles(STANDARD_LIBRARY.directory));
	const textIds = [];
	for (const { id, text } of licenseTexts) {
		texts.set(id, text);
		textIds.push(id);
	}
	return {
		authors: STANDARD_LIBRARY.authors,
		license: STANDARD_LIBRARY.license,
		name: STANDARD_LIBRARY.name,
		repository: STANDARD_LIBRARY.repository,
		texts: textIds
	};
}

async function main() {
	const metadata = /** @type {CargoMetadata} */ (
		JSON.parse(await runCargo(['metadata', '--locked', '--format-version', '1']))
	);
	const packagesByIdentity = indexPackages(metadata);
	const [nativePackages, wasmPackages] = await Promise.all([
		readBundledCargoPackages(metadata, packagesByIdentity, NATIVE_PACKAGE, 'all'),
		readBundledCargoPackages(metadata, packagesByIdentity, WASM_PACKAGE, WASM_TARGET)
	]);
	const fragment = {
		native: await buildFragment(nativePackages),
		wasm: await buildFragment(wasmPackages)
	};
	const content = `${JSON.stringify(fragment, null, '\t')}\n`;
	const previousContent = await readFile(OUTPUT_FILE, 'utf8').catch(() => '');
	if (previousContent !== content) {
		await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
		await writeFile(OUTPUT_FILE, content);
		console.warn('licenses/rust.json updated. Run "npm run build:licenses" to update LICENSE.md.');
	}
	console.log(
		`Collected ${fragment.native.packages.length} native and ${fragment.wasm.packages.length} WebAssembly crate licenses.`
	);
}

await main();
