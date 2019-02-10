import ExportDefaultVariable from '../ast/variables/ExportDefaultVariable';
import ExternalVariable from '../ast/variables/ExternalVariable';
import Variable from '../ast/variables/Variable';
import Chunk from '../Chunk';
import ExternalModule from '../ExternalModule';
import Module from '../Module';
import relativeId from './relativeId';
import { getSafeName } from './safeName';

export function deconflictChunk(
	modules: Module[],
	dependencies: (ExternalModule | Chunk)[],
	imports: Set<Variable>,
	esmOrSystem: boolean,
	interop: boolean,
	preserveModules: boolean
) {
	const usedNames: Set<string> = new Set();

	// add names of globals and find external variables
	const externalVariablesByModuleAndName: Map<
		ExternalModule,
		{ [name: string]: ExternalVariable[] }
	> = new Map();
	for (const module of modules) {
		for (const name of Object.keys(module.scope.accessedOutsideVariables)) {
			const variable = module.scope.accessedOutsideVariables[name];
			if (variable instanceof ExternalVariable) {
				let moduleVariablesByName = externalVariablesByModuleAndName.get(variable.module);
				if (!moduleVariablesByName) {
					externalVariablesByModuleAndName.set(variable.module, (moduleVariablesByName = {}));
				}
				let moduleVariablesWithSameName = moduleVariablesByName[variable.name];
				if (!moduleVariablesWithSameName) {
					moduleVariablesByName[variable.name] = moduleVariablesWithSameName = [];
				}
				moduleVariablesWithSameName.push(variable);
			} else {
				usedNames.add(variable.getBaseVariableName());
			}
		}
	}

	// deconflict external variables
	if (esmOrSystem) {
		externalVariablesByModuleAndName.forEach((moduleVariablesByName, module) => {
			for (const name of Object.keys(moduleVariablesByName)) {
				let proposedName: string;
				if (name === 'default' && interop && module.exportsNamespace) {
					proposedName = module.variableName + '__default';
				} else if (name === '*' || name === 'default') {
					proposedName = module.variableName;
				} else {
					proposedName = name;
				}
				const variableName = getSafeName(proposedName, usedNames);
				for (const variable of moduleVariablesByName[name]) {
					variable.setRenderNames(null, variableName);
				}
			}
		});
	} else {
		for (const dependency of dependencies) {
			dependency.variableName = getSafeName(dependency.variableName, usedNames);
		}
		externalVariablesByModuleAndName.forEach((moduleVariablesByName, module) => {
			// deconflict external module variable names first
			for (const name of Object.keys(moduleVariablesByName)) {
				for (const variable of moduleVariablesByName[name]) {
					if (name === 'default' && interop && (module.exportsNamespace || module.exportsNames)) {
						variable.setRenderNames(null, module.variableName + '__default');
					} else if (name === '*' || name === 'default') {
						variable.setRenderNames(null, module.variableName);
					} else {
						variable.setRenderNames(module.variableName, null);
					}
				}
			}
		});
	}

	// deconflict cross-chunk imports
	for (const variable of Array.from(imports)) {
		if (variable.module instanceof ExternalModule) continue;
		if (esmOrSystem) {
			variable.setRenderNames(null, getSafeName(variable.name, usedNames));
		} else {
			const chunk = variable.module.chunk;
			if (chunk.exportMode === 'default' || (preserveModules && variable.isNamespace)) {
				variable.setRenderNames(null, chunk.variableName);
			} else {
				variable.setRenderNames(
					chunk.variableName,
					variable.module.chunk.getVariableExportName(variable)
				);
			}
		}
	}

	// deconflict module level variables
	for (const module of modules) {
		for (const importName of Object.keys(module.importDescriptions)) {
			const importDescription = module.importDescriptions[importName];
			if (importDescription.name !== '*' && importDescription.module.chunk === module.chunk) {
				const declaration = importDescription.module.getVariableForExportName(
					importDescription.name
				);
				if (!declaration) {
					module.warn(
						{
							code: 'NON_EXISTENT_EXPORT',
							name: importDescription.name,
							source: importDescription.module.id,
							message: `Non-existent export '${
								importDescription.name
							}' is imported from ${relativeId(importDescription.module.id)}`
						},
						importDescription.start
					);
				}
			}
		}

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
		module.scope.deshadow(esmOrSystem);
	}
}
