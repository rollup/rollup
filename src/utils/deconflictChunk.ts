import Chunk from '../Chunk';
import ExternalModule from '../ExternalModule';
import Module from '../Module';
import ChildScope from '../ast/scopes/ChildScope';
import ExportDefaultVariable from '../ast/variables/ExportDefaultVariable';
import SyntheticNamedExportVariable from '../ast/variables/SyntheticNamedExportVariable';
import Variable from '../ast/variables/Variable';
import { GetInterop, InternalModuleFormat } from '../rollup/types';
import {
	canDefaultBeTakenFromNamespace,
	defaultInteropHelpersByInteropType,
	isDefaultAProperty,
	namespaceInteropHelpersByInteropType
} from './interopHelpers';
import { getSafeName } from './safeName';

export interface DependenciesToBeDeconflicted {
	deconflictedDefault: Set<ExternalModule>;
	deconflictedNamespace: Set<ExternalModule | Chunk>;
	dependencies: Set<ExternalModule | Chunk>;
}

const DECONFLICT_IMPORTED_VARIABLES_BY_FORMAT: {
	[format in InternalModuleFormat]: (
		usedNames: Set<string>,
		imports: Set<Variable>,
		dependenciesToBeDeconflicted: DependenciesToBeDeconflicted,
		interop: GetInterop,
		preserveModules: boolean,
		externalLiveBindings: boolean,
		chunkByModule: Map<Module, Chunk>,
		syntheticExports: Set<SyntheticNamedExportVariable>
	) => void;
} = {
	amd: deconflictImportsOther,
	cjs: deconflictImportsOther,
	es: deconflictImportsEsmOrSystem,
	iife: deconflictImportsOther,
	system: deconflictImportsEsmOrSystem,
	umd: deconflictImportsOther
};

export function deconflictChunk(
	modules: readonly Module[],
	dependenciesToBeDeconflicted: DependenciesToBeDeconflicted,
	imports: Set<Variable>,
	usedNames: Set<string>,
	format: InternalModuleFormat,
	interop: GetInterop,
	preserveModules: boolean,
	externalLiveBindings: boolean,
	chunkByModule: Map<Module, Chunk>,
	syntheticExports: Set<SyntheticNamedExportVariable>,
	exportNamesByVariable: ReadonlyMap<Variable, string[]>,
	accessedGlobalsByScope: ReadonlyMap<ChildScope, Set<string>>,
	includedNamespaces: ReadonlySet<Module>
): void {
	const reversedModules = modules.slice().reverse();
	for (const module of reversedModules) {
		module.scope.addUsedOutsideNames(
			usedNames,
			format,
			exportNamesByVariable,
			accessedGlobalsByScope
		);
	}
	deconflictTopLevelVariables(usedNames, reversedModules, includedNamespaces);
	DECONFLICT_IMPORTED_VARIABLES_BY_FORMAT[format](
		usedNames,
		imports,
		dependenciesToBeDeconflicted,
		interop,
		preserveModules,
		externalLiveBindings,
		chunkByModule,
		syntheticExports
	);

	for (const module of reversedModules) {
		module.scope.deconflict(format, exportNamesByVariable, accessedGlobalsByScope);
	}
}

function deconflictImportsEsmOrSystem(
	usedNames: Set<string>,
	imports: ReadonlySet<Variable>,
	dependenciesToBeDeconflicted: DependenciesToBeDeconflicted,
	_interop: GetInterop,
	preserveModules: boolean,
	_externalLiveBindings: boolean,
	chunkByModule: Map<Module, Chunk>,
	syntheticExports: Set<SyntheticNamedExportVariable>
) {
	// This is needed for namespace reexports
	for (const dependency of dependenciesToBeDeconflicted.dependencies) {
		if (preserveModules || dependency instanceof ExternalModule) {
			dependency.variableName = getSafeName(dependency.suggestedVariableName, usedNames);
		}
	}
	for (const variable of imports) {
		const module = variable.module!;
		const name = variable.name;
		if (variable.isNamespace && (preserveModules || module instanceof ExternalModule)) {
			variable.setRenderNames(
				null,
				(module instanceof ExternalModule ? module : chunkByModule.get(module)!).variableName
			);
		} else if (module instanceof ExternalModule && name === 'default') {
			variable.setRenderNames(
				null,
				getSafeName(
					[...module.exportedVariables].some(
						([exportedVariable, exportedName]) => exportedName === '*' && exportedVariable.included
					)
						? module.suggestedVariableName + '__default'
						: module.suggestedVariableName,
					usedNames
				)
			);
		} else {
			variable.setRenderNames(null, getSafeName(name, usedNames));
		}
	}
	for (const variable of syntheticExports) {
		variable.setRenderNames(null, getSafeName(variable.name, usedNames));
	}
}

function deconflictImportsOther(
	usedNames: Set<string>,
	imports: Set<Variable>,
	{ deconflictedDefault, deconflictedNamespace, dependencies }: DependenciesToBeDeconflicted,
	interop: GetInterop,
	preserveModules: boolean,
	externalLiveBindings: boolean,
	chunkByModule: Map<Module, Chunk>
): void {
	for (const chunkOrExternalModule of dependencies) {
		chunkOrExternalModule.variableName = getSafeName(
			chunkOrExternalModule.suggestedVariableName,
			usedNames
		);
	}
	for (const externalModuleOrChunk of deconflictedNamespace) {
		externalModuleOrChunk.namespaceVariableName = getSafeName(
			`${externalModuleOrChunk.suggestedVariableName}__namespace`,
			usedNames
		);
	}
	for (const externalModule of deconflictedDefault) {
		if (
			deconflictedNamespace.has(externalModule) &&
			canDefaultBeTakenFromNamespace(String(interop(externalModule.id)), externalLiveBindings)
		) {
			externalModule.defaultVariableName = externalModule.namespaceVariableName;
		} else {
			externalModule.defaultVariableName = getSafeName(
				`${externalModule.suggestedVariableName}__default`,
				usedNames
			);
		}
	}
	for (const variable of imports) {
		const module = variable.module;
		if (module instanceof ExternalModule) {
			const name = variable.name;
			if (name === 'default') {
				const moduleInterop = String(interop(module.id));
				const variableName = defaultInteropHelpersByInteropType[moduleInterop]
					? module.defaultVariableName
					: module.variableName;
				if (isDefaultAProperty(moduleInterop, externalLiveBindings)) {
					variable.setRenderNames(variableName, 'default');
				} else {
					variable.setRenderNames(null, variableName);
				}
			} else if (name === '*') {
				variable.setRenderNames(
					null,
					namespaceInteropHelpersByInteropType[String(interop(module.id))]
						? module.namespaceVariableName
						: module.variableName
				);
			} else {
				// if the second parameter is `null`, it uses its "name" for the property name
				variable.setRenderNames(module.variableName, null);
			}
		} else {
			const chunk = chunkByModule.get(module!)!;
			if (preserveModules && variable.isNamespace) {
				variable.setRenderNames(
					null,
					chunk.exportMode === 'default' ? chunk.namespaceVariableName : chunk.variableName
				);
			} else if (chunk.exportMode === 'default') {
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

function deconflictTopLevelVariables(
	usedNames: Set<string>,
	modules: readonly Module[],
	includedNamespaces: ReadonlySet<Module>
): void {
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
		if (includedNamespaces.has(module)) {
			const namespace = module.namespace;
			namespace.setRenderNames(null, getSafeName(namespace.name, usedNames));
		}
	}
}
