import ExportDefaultVariable from '../ast/variables/ExportDefaultVariable';
import SyntheticNamedExportVariable from '../ast/variables/SyntheticNamedExportVariable';
import Variable from '../ast/variables/Variable';
import Chunk from '../Chunk';
import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { InternalModuleFormat } from '../rollup/types';
import { getSafeName } from './safeName';

const DECONFLICT_IMPORTED_VARIABLES_BY_FORMAT: {
	[format in InternalModuleFormat]: (
		usedNames: Set<string>,
		imports: Set<Variable>,
		dependenciesToBeDeconflicted: {
			deconflictedDefault: Set<ExternalModule>;
			dependencies: Set<ExternalModule | Chunk>;
		},
		interop: boolean,
		preserveModules: boolean,
		chunkByModule: Map<Module, Chunk>,
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
	dependenciesToBeDeconflicted: {
		deconflictedDefault: Set<ExternalModule>;
		dependencies: Set<ExternalModule | Chunk>;
	},
	imports: Set<Variable>,
	usedNames: Set<string>,
	format: InternalModuleFormat,
	interop: boolean,
	preserveModules: boolean,
	chunkByModule: Map<Module, Chunk>,
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
		dependenciesToBeDeconflicted,
		interop,
		preserveModules,
		chunkByModule,
		syntheticExports
	);

	for (const module of modules) {
		module.scope.deconflict(format, exportNamesByVariable);
	}
}

function deconflictImportsEsm(
	usedNames: Set<string>,
	imports: Set<Variable>,
	dependenciesToBeDeconflicted: {
		deconflictedDefault: Set<ExternalModule>;
		dependencies: Set<ExternalModule | Chunk>;
	},
	interop: boolean,
	_preserveModules: boolean,
	_chunkByModule: Map<Module, Chunk>,
	syntheticExports: Set<SyntheticNamedExportVariable>
) {
	for (const dependency of dependenciesToBeDeconflicted.dependencies) {
		dependency.variableName = getSafeName(dependency.variableName, usedNames);
	}
	deconflictImportsEsmOrSystem(usedNames, imports, dependenciesToBeDeconflicted, interop);
	for (const variable of syntheticExports) {
		variable.setSafeName(getSafeName(variable.name, usedNames));
	}
}

function deconflictImportsEsmOrSystem(
	usedNames: Set<string>,
	imports: Set<Variable>,
	_dependenciesToBeDeconflicted: {
		deconflictedDefault: Set<ExternalModule>;
		dependencies: Set<ExternalModule | Chunk>;
	},
	interop: boolean
) {
	for (const variable of imports) {
		const module = variable.module;
		const name = variable.name;
		let proposedName: string;
		if (module instanceof ExternalModule && (name === '*' || name === 'default')) {
			if (
				name === 'default' &&
				interop &&
				[...module.exportedVariables].some(([variable, name]) => name === '*' && variable.included)
			) {
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
	{
		dependencies,
		deconflictedDefault
	}: { deconflictedDefault: Set<ExternalModule>; dependencies: Set<ExternalModule | Chunk> },
	interop: boolean,
	preserveModules: boolean,
	chunkByModule: Map<Module, Chunk>
) {
	for (const externalModule of deconflictedDefault) {
		externalModule.defaultVariableName = getSafeName(
			`${externalModule.variableName}__default`,
			usedNames
		);
	}
	// TODO Lukas this overwrites the actual variable name, use a different variable
	for (const chunkOrExternalModule of dependencies) {
		chunkOrExternalModule.variableName = getSafeName(chunkOrExternalModule.variableName, usedNames);
	}
	for (const variable of imports) {
		const module = variable.module;
		if (module instanceof ExternalModule) {
			const name = variable.name;
			if (name === 'default' && interop) {
				variable.setRenderNames(module.defaultVariableName, 'default');
			} else if (name === '*' || name === 'default') {
				variable.setRenderNames(null, module.variableName);
			} else {
				variable.setRenderNames(module.variableName, null);
			}
		} else {
			const chunk = chunkByModule.get(module!)!;
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
