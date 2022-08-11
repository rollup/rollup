import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { PluginImpl } from 'rollup';
import license, { type Dependency, type Person } from 'rollup-plugin-license';

async function generateLicenseFile(
	dir: string,
	dependencies: readonly Dependency[]
): Promise<void> {
	const coreLicense = await fs.readFile('LICENSE-CORE.md', 'utf8');
	const licenses = new Set<string>();
	const dependencyLicenseTexts = Array.from(dependencies)
		.filter(({ name }) => name !== '@rollup/browser')
		.sort(({ name: nameA }, { name: nameB }) => (nameA! > nameB! ? 1 : -1))
		.map(({ name, license, licenseText, author, maintainers, contributors, repository }) => {
			let text = `## ${name}\n`;
			if (license) {
				text += `License: ${license}\n`;
			}
			const names = new Set<string>();
			if (author?.name) {
				names.add(author.name);
			}
			// TODO there is an inconsistency in the rollup-plugin-license types
			for (const person of contributors.concat(maintainers as unknown as Person[])) {
				if (person?.name) {
					names.add(person.name);
				}
			}
			if (names.size > 0) {
				text += `By: ${Array.from(names).join(', ')}\n`;
			}
			if (repository) {
				text += `Repository: ${(typeof repository === 'object' && repository.url) || repository}\n`;
			}
			if (licenseText) {
				text +=
					'\n' +
					licenseText
						.trim()
						.replace(/(\r\n|\r)/gm, '\n')
						.split('\n')
						.map(line => `> ${line}`)
						.join('\n') +
					'\n';
			}
			licenses.add(license!);
			return text;
		})
		.join('\n---------------------------------------\n\n');
	const licenseText =
		`# Rollup core license\n` +
		`Rollup is released under the MIT license:\n\n` +
		coreLicense +
		`\n# Licenses of bundled dependencies\n` +
		`The published Rollup artifact additionally contains code with the following licenses:\n` +
		`${Array.from(licenses).join(', ')}\n\n` +
		`# Bundled dependencies:\n` +
		dependencyLicenseTexts;
	const licenseFile = join(dir, 'LICENSE.md');
	const existingLicenseText = await fs.readFile(licenseFile, 'utf8');
	if (existingLicenseText !== licenseText) {
		await fs.writeFile(licenseFile, licenseText);
		console.warn('LICENSE.md updated. You should commit the updated file.');
	}
}

interface LicenseHandler {
	collectLicenses: PluginImpl;
	writeLicense: PluginImpl;
}

export default function getLicenseHandler(dir: string): LicenseHandler {
	const licenses = new Map<string, Dependency>();
	function addLicenses(dependencies: readonly Dependency[]) {
		for (const dependency of dependencies) {
			licenses.set(dependency.name!, dependency);
		}
	}
	return {
		collectLicenses() {
			return license({ thirdParty: addLicenses });
		},
		writeLicense() {
			return {
				name: 'write-license',
				writeBundle() {
					return generateLicenseFile(dir, Array.from(licenses.values()));
				}
			};
		}
	};
}
