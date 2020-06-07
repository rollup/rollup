import ExportDefaultVariable from '../ast/variables/ExportDefaultVariable';
import SyntheticNamedExportVariable from '../ast/variables/SyntheticNamedExportVariable';
import Variable from '../ast/variables/Variable';
import Chunk from '../Chunk';
import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { getSafeName } from './safeName';

const DECONFLICT_IMPORTED_VARIABLES_BY_FORMAT: {
	[format: string]: (
		usedNames: Set<string>,
		imports: Set<Variable>,
		dependencies: Set<ExternalModule | Chunk>,
		interop: boolean,
		preserveModules: boolean,
		syntheticExports: Set<SyntheticNamedExportVariable>
	) => void;
} = {
	amd: deconflictImportsOther,
	cjs: deconflictImportsOther,
	es: deconflictImportsEsm,
	iife: deconflictImportsOther,
	system: deconflictImportsEsmOrSystem,
	umd: deconflictImportsOther
};

export function deconflictChunk(
	modules: Module[],
	dependencies: Set<ExternalModule | Chunk>,
	imports: Set<Variable>,
	usedNames: Set<string>,
	format: string,
	interop: boolean,
	preserveModules: boolean,
	syntheticExports: Set<SyntheticNamedExportVariable>,
	exportNamesByVariable: Map<Variable, string[]>
) {
	for (const module of modules) {
		module.scope.addUsedOutsideNames(usedNames, format, exportNamesByVariable);
	}
	deconflictTopLevelVariables(usedNames, modules);
	DECONFLICT_IMPORTED_VARIABLES_BY_FORMAT[format](
		usedNames,
		imports,
		dependencies,
		interop,
		preserveModules,
		syntheticExports
	);

	for (const module of modules) {
		module.scope.deconflict(format, exportNamesByVariable);
	}
}

function deconflictImportsEsm(
	usedNames: Set<string>,
	imports: Set<Variable>,
	dependencies: Set<ExternalModule | Chunk>,
	interop: boolean,
	preserveModules: boolean,
	syntheticExports: Set<SyntheticNamedExportVariable>
) {
	// Deconflict re-exported variables of dependencies when preserveModules is true.
	// However, this implementation will result in unnecessary variable renaming without
	// a deeper, wider fix.
	//
	// TODO: https://github.com/rollup/rollup/pull/3435#discussion_r390792792
	if (preserveModules) {
		for (const chunkOrExternalModule of dependencies) {
			chunkOrExternalModule.variableName = getSafeName(
				chunkOrExternalModule.variableName,
				usedNames
			);
		}
	}
	deconflictImportsEsmOrSystem(usedNames, imports, dependencies, interop);
	for (const variable of syntheticExports) {
		variable.setSafeName(getSafeName(variable.name, usedNames));
	}
}

function deconflictImportsEsmOrSystem(
	usedNames: Set<string>,
	imports: Set<Variable>,
	_dependencies: Set<ExternalModule | Chunk>,
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
	usedNames: Set<string>,
	imports: Set<Variable>,
	dependencies: Set<ExternalModule | Chunk>,
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
			const chunk = module!.chunk!;
			if (chunk.exportMode === 'default' || (preserveModules && variable.isNamespace)) {
				variable.setRenderNames(null, chunk.variableName);
			} else {
				variable.setRenderNames(
					chunk.variableName,
					chunk.getVariableExportName(variable) as string | null
				);
			}
		}
	}
}

function deconflictTopLevelVariables(usedNames: Set<string>, modules: Module[]) {
	for (const module of modules) {
		for (const variable of module.scope.variables.values()) {
			if (
				variable.included &&
				// this will only happen for exports in some formats
				!(
					variable.renderBaseName ||
					(variable instanceof ExportDefaultVariable && variable.getOriginalVariable() !== variable)
				)
			) {
				variable.setRenderNames(null, getSafeName(variable.name, usedNames));
			}
		}
		const namespace = module.namespace;
		if (namespace.included) {
			namespace.setRenderNames(null, getSafeName(namespace.name, usedNames));
		}
	}
}
