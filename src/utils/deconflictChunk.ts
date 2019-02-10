import ExportDefaultVariable from '../ast/variables/ExportDefaultVariable';
import Variable from '../ast/variables/Variable';
import Chunk from '../Chunk';
import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { getSafeName } from './safeName';

export function deconflictChunk(
	modules: Module[],
	dependencies: (ExternalModule | Chunk)[],
	imports: Set<Variable>,
	esmOrSystem: boolean,
	interop: boolean,
	preserveModules: boolean
) {
	const usedNames: { [name: string]: true } = Object.create(null);

	// add names of globals
	for (const module of modules) {
		Object.assign(usedNames, module.scope.accessedOutsideVariables);
	}

	// deconflict chunk imports
	if (esmOrSystem) {
		for (const variable of Array.from(imports)) {
			const module = variable.module;
			const name = variable.name;
			let proposedName: string;
			if (module instanceof ExternalModule && (name === '*' || name === 'default')) {
				if (name === 'default' && interop && module.exportsNamespace) {
					proposedName = module.variableName + '__default';
				} else {
					proposedName = module.variableName;
				}
			} else {
				proposedName = name;
			}
			variable.setRenderNames(null, getSafeName(proposedName, usedNames));
		}
	} else {
		for (const dependency of dependencies) {
			dependency.variableName = getSafeName(dependency.variableName, usedNames);
		}
		for (const variable of Array.from(imports)) {
			const module = variable.module;
			if (module instanceof ExternalModule) {
				const name = variable.name;
				if (name === 'default' && interop && (module.exportsNamespace || module.exportsNames)) {
					variable.setRenderNames(null, module.variableName + '__default');
				} else if (name === '*' || name === 'default') {
					variable.setRenderNames(null, module.variableName);
				} else {
					variable.setRenderNames(module.variableName, null);
				}
			} else {
				const chunk = module.chunk;
				if (chunk.exportMode === 'default' || (preserveModules && variable.isNamespace)) {
					variable.setRenderNames(null, chunk.variableName);
				} else {
					variable.setRenderNames(chunk.variableName, module.chunk.getVariableExportName(variable));
				}
			}
		}
	}

	// deconflict module level variables
	for (const module of modules) {
		const moduleVariables = module.scope.variables;
		for (const name of Object.keys(moduleVariables)) {
			const variable = moduleVariables[name];
			if (
				!(
					variable.renderBaseName ||
					(variable instanceof ExportDefaultVariable && variable.referencesOriginal())
				)
			) {
				variable.setRenderNames(null, getSafeName(variable.name, usedNames));
			}
		}
		const namespace = module.getOrCreateNamespace();
		if (namespace.included) {
			namespace.setRenderNames(null, getSafeName(namespace.name, usedNames));
		}
	}

	for (const module of modules) {
		module.scope.deconflict();
	}
}
