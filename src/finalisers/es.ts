import { blank, keys, values } from '../utils/object';
import { Bundle as MagicStringBundle } from 'magic-string';
import Bundle from '../Bundle';
import ExternalModule from '../ExternalModule';
import Module from '../Module';
import ExternalVariable, { isExternalVariable } from '../ast/variables/ExternalVariable';
import ImportDeclaration from '../ast/nodes/ImportDeclaration';
import NamespaceVariable from '../ast/variables/NamespaceVariable';
import ImportNamedDeclaration from '../ast/nodes/ImportNamedDeclaration';
import ImportSpecifier from '../ast/nodes/ImportSpecifier';
import ImportDefaultSpecifier from '../ast/nodes/ImportDefaultSpecifier';
import ImportNamespaceSpecifier from '../ast/nodes/ImportNamespaceSpecifier';
import Variable from '../ast/variables/Variable';

function notDefault (name: string) {
	return name !== 'default';
}

export function createSpecifierString (imported: string, local: string) {
	if (local !== imported) {
		return `${imported} as ${local}`;
	} else {
		return imported;
	}
}

export function createSources (otherModule: Module | ExternalModule, node: ImportDeclaration) {
	function resolveId (value: string) {
		return node.module.resolvedIds[value] || node.module.resolvedExternalIds[value];
	}

	const sources = blank();
	if (otherModule.isExternal && !node) {
		keys(otherModule.declarations).forEach(key => {
			const declaration = otherModule.declarations[key];
			// if (!node && !module.imports[key]) {
			// 	return;
			// }

			sources[declaration.name] = {
				included: declaration.included,
				// name: declaration.name,
				// safeName: declaration.safeName
				imported: declaration.name,
				local: declaration instanceof ExternalVariable ? declaration.safeName : null
			};
		});
	}
	if (node) {
		const { module } = node;

		const namespacedVariables = values(module.scope.namespacedVariables).filter(variable => {
			return (variable instanceof NamespaceVariable || variable instanceof ExternalVariable) && variable.module === otherModule;
		});
		namespacedVariables.forEach(variable => {
			sources[variable.name] = {
				included: true,
				imported: variable.name,
				local: variable instanceof ExternalVariable ? variable.name : null
			};
		});

		const id = resolveId(node.source.value.toString());
		const importNodes = (<(ImportDeclaration | ImportNamedDeclaration)[]>module.ast.body.filter(n => {
			return n instanceof ImportDeclaration || n instanceof ImportNamedDeclaration;
		})).filter(n => {
			if (n instanceof ImportDeclaration || n instanceof ImportNamedDeclaration) {
				const _id = resolveId(n.source.value.toString());
				return _id === id;
			}
		});
		const specifiers = importNodes.reduce((specifiers, node) => {
			(node.specifiers as (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[]).forEach(specifier => {
				let name;
				if (specifier.type === 'ImportDefaultSpecifier') {
					name = 'default';
				} else if (specifier.type === 'ImportSpecifier') {
					name = specifier.local.name;
				} else if (specifier.type === 'ImportNamespaceSpecifier') {
					name = '*';
				}
				if (name) {
					specifiers[name] = specifier;
				}
			});
			return specifiers;
		}, blank());
		keys(specifiers).forEach(key => {
			const specifier = specifiers[key];
			if (specifier) {
				sources[key] = {
					included: specifier.included,
					imported: specifier.imported ? specifier.imported.name : specifier.local.name,
					local: specifier.local.name
				};
			}
		});
	}
	return sources;
}

export function createImportString (otherModule: Module | ExternalModule, { getPath, node }: {
	getPath: (name: string) => string;
	node: ImportDeclaration;
}) {
	const sources = createSources(otherModule, node);
	const specifiers: string[] = [];
	const specifiersList = [specifiers];
	const importedNames = keys(sources)
		.filter(name => name !== '*' && name !== 'default')
		.filter(name => sources[name].included)
		.map(name => {
			if (name[0] === '*' && otherModule instanceof ExternalModule) {
				return `* as ${otherModule.name}`;
			}

			const source = sources[name];

			return createSpecifierString(source.imported, source.local);
		})
		.filter(Boolean);

	if (sources.default) {
		if (otherModule instanceof ExternalModule) {
			let name = sources.default.local;
			if (!node && otherModule.name) {
				name = otherModule.name;
			}
			if (otherModule.exportsNamespace && !node) {
				specifiersList.push([`${name}__default`]);
			} else {
				specifiers.push(name);
			}
		} else {
			specifiers.push(sources.default.local);
		}
	}

	const namespaceSpecifier =
		sources['*'] && sources['*'].included
			? `* as ${otherModule instanceof ExternalModule ? otherModule.name : sources['*'].local}` : null; // TODO prevent unnecessary namespace import, e.g form/external-imports
	const namedSpecifier = importedNames.length
		? `{ ${importedNames.sort().join(', ')} }`
		: null;

	if (namespaceSpecifier && namedSpecifier) {
		// Namespace and named specifiers cannot be combined.
		specifiersList.push([namespaceSpecifier]);
		specifiers.push(namedSpecifier);
	} else if (namedSpecifier) {
		specifiers.push(namedSpecifier);
	} else if (namespaceSpecifier) {
		specifiers.push(namespaceSpecifier);
	}

	const id = node && typeof node.source.value === 'string' ? node.source.value : otherModule.id;

	return specifiersList
		.map(specifiers => {
			if (specifiers.length) {
				return `import ${specifiers.join(', ')} from '${getPath(
					id
				)}';`;
			}

			return otherModule instanceof ExternalModule && otherModule.reexported ? null : `import '${getPath(id)}';`;
		})
		.filter(Boolean)
		.join('\n');
}

function createExportSpecifierString (name: string, declaration: Variable) {
	const rendered = declaration.getName(true);
	return rendered === name ? name : `${rendered} as ${name}`;
}

export default function es (bundle: Bundle, magicString: MagicStringBundle, { getPath, intro, outro }: {
	exportMode: string;
	indentString: string;
	getPath: (name: string) => string;
	intro: string;
	outro: string
}) {
	const importBlock = bundle.externalModules
		.map(module => {
			return createImportString(module, { getPath, node: null });
		})
		.join('\n');

	if (importBlock) intro += importBlock + '\n\n';
	if (intro) magicString.prepend(intro);

	const module = bundle.entryModule;

	const exportInternalSpecifiers: string[] = [];
	const exportExternalSpecifiers = new Map();
	const exportAllDeclarations: string[] = [];

	module
		.getExports()
		.filter(notDefault)
		.forEach(name => {
			const [declaration] = module.traceExport(name);
			exportInternalSpecifiers.push(
				createExportSpecifierString(name, declaration)
			);
		});

	module.getReexports().forEach(name => {
		const [declaration] = module.traceExport(name);

		if (isExternalVariable(declaration)) {
			if (name[0] === '*') {
				// export * from 'external'
				exportAllDeclarations.push(`export * from '${name.slice(1)}';`);
			} else {
				if (!exportExternalSpecifiers.has(declaration.module.id)) {
					exportExternalSpecifiers.set(declaration.module.id, []);
				}
				exportExternalSpecifiers
					.get(declaration.module.id)
					.push(declaration.name === name ? name : `${declaration.name} as ${name}`);
			}

			return;
		}

		exportInternalSpecifiers.push(
			createExportSpecifierString(name, declaration)
		);
	});

	const exportBlock: string[] = [];
	if (exportInternalSpecifiers.length)
		exportBlock.push(`export { ${exportInternalSpecifiers.join(', ')} };`);
	if (module.exports.default)
		exportBlock.push(
			`export default ${module.traceExport('default')[0].getName(true)};`
		);
	if (exportAllDeclarations.length)
		exportBlock.push(exportAllDeclarations.join('\n'));
	if (exportExternalSpecifiers.size) {
		exportExternalSpecifiers.forEach((specifiers, id) => {
			exportBlock.push(`export { ${specifiers.join(', ')} } from '${id}';`);
		});
	}

	if (exportBlock.length)
		(<any> magicString).append('\n\n' + exportBlock.join('\n').trim()); // TODO TypeScript: Awaiting PR

	if (outro) (<any> magicString).append(outro); // TODO TypeScript: Awaiting PR

	return (<any> magicString).trim(); // TODO TypeScript: Awaiting PR
}
