import { ModuleDeclarationDependency } from '../../Chunk';

export default function trimEmptyImports(
	dependencies: ModuleDeclarationDependency[]
): ModuleDeclarationDependency[] {
	let i = dependencies.length;

	while (i--) {
		const { imports, reexports } = dependencies[i];
		if (imports || reexports) {
			return dependencies.slice(0, i + 1);
		}
	}

	return [];
}
