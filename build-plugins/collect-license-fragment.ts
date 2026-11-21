import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'rollup';
import license, { type Dependency, type Person } from 'rollup-plugin-license';

interface LicenseFragmentPackage {
	authors: string[];
	license: string | null;
	name: string;
	repository: string | null;
	texts: string[];
}

interface LicenseFragment {
	packages: LicenseFragmentPackage[];
	texts: Record<string, string>;
}

export interface LicenseFragmentCollector {
	collector: () => Plugin;
	writer: () => Plugin;
}

const IGNORED_PACKAGE_NAMES = new Set(['@rollup/browser']);

function getTextId(text: string): string {
	return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function collectAuthorNames(dependency: Dependency): string[] {
	const names = new Set<string>();
	if (dependency.author?.name) {
		names.add(dependency.author.name);
	}
	// TODO there is an inconsistency in the rollup-plugin-license types
	for (const person of [
		...dependency.contributors,
		...(dependency.maintainers as unknown as Person[])
	]) {
		if (person?.name) {
			names.add(person.name);
		}
	}
	return [...names];
}

function getRepositoryUrl(repository: Dependency['repository']): string | null {
	if (!repository) return null;
	return typeof repository === 'object' ? repository.url : repository;
}

function toFragmentPackage(
	dependency: Dependency,
	texts: Map<string, string>
): LicenseFragmentPackage {
	const textIds = new Set<string>();
	for (const licenseText of [dependency.licenseText, dependency.noticeText]) {
		if (!licenseText?.trim()) continue;
		const textId = getTextId(licenseText);
		texts.set(textId, licenseText);
		textIds.add(textId);
	}
	return {
		authors: collectAuthorNames(dependency),
		license: dependency.license,
		name: dependency.name!,
		repository: getRepositoryUrl(dependency.repository),
		texts: [...textIds]
	};
}

async function writeLicenseFragment(
	fragmentFile: string,
	dependencies: readonly Dependency[]
): Promise<void> {
	const texts = new Map<string, string>();
	const packages = [...dependencies]
		.filter(({ name }) => !IGNORED_PACKAGE_NAMES.has(name!))
		.sort(({ name: nameA }, { name: nameB }) => (nameA! > nameB! ? 1 : -1))
		.map(dependency => toFragmentPackage(dependency, texts));
	const fragment: LicenseFragment = {
		packages,
		texts: Object.fromEntries(
			[...texts].sort(([textIdA], [textIdB]) => (textIdA > textIdB ? 1 : -1))
		)
	};
	const content = `${JSON.stringify(fragment, null, '\t')}\n`;
	const previousContent = await readFile(fragmentFile, 'utf8').catch(() => '');
	if (previousContent !== content) {
		await mkdir(path.dirname(fragmentFile), { recursive: true });
		await writeFile(fragmentFile, content);
		console.warn(
			`${path.relative(process.cwd(), fragmentFile)} updated. Run "npm run build:licenses" to update LICENSE.md.`
		);
	}
}

/**
/**
 * The Node artifacts combine the CJS build (CLI) and the ESM build, so both need
 * to collect their dependencies while only the ESM build writes the fragment.
 */
export default function getLicenseFragmentCollector(
	fragmentFile: string
): LicenseFragmentCollector {
	const dependencies = new Map<string, Dependency>();
	return {
		collector: () =>
			license({
				thirdParty(collectedDependencies) {
					for (const dependency of collectedDependencies) {
						dependencies.set(dependency.name!, dependency);
					}
				}
			}),
		writer: () => ({
			name: 'write-license-fragment',
			async writeBundle() {
				await writeLicenseFragment(fragmentFile, [...dependencies.values()]);
			}
		})
	};
}
