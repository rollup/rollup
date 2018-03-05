import { ModuleDeclarationDependency } from '../../Chunk';

export default function trimEmptyImports(dependencies: ModuleDeclarationDependency[]) {
	let i = dependencies.length;

	while (i--) {
		const dependency = dependencies[i];
		if (dependency.exportsDefault || dependency.exportsNames || dependency.exportsNamespace) {
			return dependencies.slice(0, i + 1);
		}
	}

	return [];
}
