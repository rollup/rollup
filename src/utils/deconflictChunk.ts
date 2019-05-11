import ExportDefaultVariable from '../ast/variables/ExportDefaultVariable';
import Variable from '../ast/variables/Variable';
import Chunk from '../Chunk';
import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { NameCollection, RESERVED_NAMES_BY_FORMAT } from './reservedNames';
import { getSafeName } from './safeName';

const DECONFLICT_IMPORTED_VARIABLES_BY_FORMAT: {
	[format: string]: (
		usedNames: NameCollection,
		imports: Set<Variable>,
		dependencies: (ExternalModule | Chunk)[],
		interop: boolean,
		preserveModules: boolean
	) => void;
} = {
	amd: deconflictImportsOther,
	cjs: deconflictImportsOther,
	es: deconflictImportsEsm,
	iife: deconflictImportsOther,
	system: deconflictImportsEsm,
	umd: deconflictImportsOther
};

export function deconflictChunk(
	modules: Module[],
	dependencies: (ExternalModule | Chunk)[],
	imports: Set<Variable>,
	usedNames: NameCollection,
	format: string,
	interop: boolean,
	preserveModules: boolean
) {
	const { forbiddenNames, formatGlobals } = RESERVED_NAMES_BY_FORMAT[format];
	Object.assign(usedNames, forbiddenNames);
	Object.assign(usedNames, formatGlobals);
	addUsedGlobalNames(usedNames, modules);
	deconflictTopLevelVariables(usedNames, modules);
	DECONFLICT_IMPORTED_VARIABLES_BY_FORMAT[format](
		usedNames,
		imports,
		dependencies,
		interop,
		preserveModules
	);

	for (const module of modules) {
		module.scope.deconflict(forbiddenNames);
	}
}

function addUsedGlobalNames(usedNames: NameCollection, modules: Module[]) {
	const accessedGlobals: { [name: string]: Variable } = Object.assign(
		{},
		...modules.map(module => module.scope.accessedOutsideVariables)
	);

	for (const name of Object.keys(accessedGlobals)) {
		const variable = accessedGlobals[name];
		if (variable.included) {
			usedNames[name] = true;
		}
	}
}

function deconflictImportsEsm(
	usedNames: NameCollection,
	imports: Set<Variable>,
	_dependencies: (ExternalModule | Chunk)[],
	interop: boolean
) {
	for (const variable of imports) {
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
}

function deconflictImportsOther(
	usedNames: NameCollection,
	imports: Set<Variable>,
	dependencies: (ExternalModule | Chunk)[],
	interop: boolean,
	preserveModules: boolean
) {
	for (const chunkOrExternalModule of dependencies) {
		chunkOrExternalModule.variableName = getSafeName(chunkOrExternalModule.variableName, usedNames);
	}
	for (const variable of imports) {
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

function deconflictTopLevelVariables(usedNames: NameCollection, modules: Module[]) {
	for (const module of modules) {
		const moduleVariables = module.scope.variables;
		for (const name of Object.keys(moduleVariables)) {
			const variable = moduleVariables[name];
			if (
				variable.included &&
				// this will only happen for exports in some formats
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
}
