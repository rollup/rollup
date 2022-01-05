import { readFileSync, writeFileSync } from 'fs';
import { PluginImpl } from 'rollup';
import license, { Dependency, Person } from 'rollup-plugin-license';

function generateLicenseFile(dependencies: Dependency[]) {
	const coreLicense = readFileSync('LICENSE-CORE.md');
	const licenses = new Set();
	const dependencyLicenseTexts = dependencies
		.sort(({ name: nameA }, { name: nameB }) => (nameA! > nameB! ? 1 : -1))
		.map(({ name, license, licenseText, author, maintainers, contributors, repository }) => {
			let text = `## ${name}\n`;
			if (license) {
				text += `License: ${license}\n`;
			}
			const names = new Set();
			if (author && author.name) {
				names.add(author.name);
			}
			// TODO there is an inconsistency in the rollup-plugin-license types
			for (const person of contributors.concat(maintainers as unknown as Person[])) {
				if (person && person.name) {
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
			licenses.add(license);
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
	const existingLicenseText = readFileSync('LICENSE.md', 'utf8');
	if (existingLicenseText !== licenseText) {
		writeFileSync('LICENSE.md', licenseText);
		console.warn('LICENSE.md updated. You should commit the updated file.');
	}
}

export default function getLicenseHandler(): {
	collectLicenses: PluginImpl;
	writeLicense: PluginImpl;
} {
	const licenses = new Map();
	return {
		collectLicenses() {
			function addLicenses(dependencies: Dependency[]) {
				for (const dependency of dependencies) {
					licenses.set(dependency.name, dependency);
				}
			}

			return license({ thirdParty: addLicenses });
		},
		writeLicense() {
			return {
				name: 'write-license',
				writeBundle() {
					generateLicenseFile(Array.from(licenses.values()));
				}
			};
		}
	};
}
