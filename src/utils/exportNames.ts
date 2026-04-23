import type Variable from '../ast/variables/Variable';
import RESERVED_NAMES from './RESERVED_NAMES';
import { toBase64 } from './base64';

export function assignExportsToMangledNames(
	exports: ReadonlySet<Variable>,
	exportsByName: Map<string, Variable>,
	exportNamesByVariable: Map<Variable, string[]>
): void {
	let nameIndex = 0;
	for (const variable of getSortedExports(exports)) {
		let [exportName] = variable.name;
		if (exportsByName.has(exportName)) {
			do {
				exportName = toBase64(++nameIndex);
				// skip past leading number identifiers
				if (exportName.charCodeAt(0) === 49 /* '1' */) {
					nameIndex += 9 * 64 ** (exportName.length - 1);
					exportName = toBase64(nameIndex);
				}
			} while (RESERVED_NAMES.has(exportName) || exportsByName.has(exportName));
		}
		exportsByName.set(exportName, variable);
		exportNamesByVariable.set(variable, [exportName]);
	}
}

export function assignExportsToNames(
	exports: ReadonlySet<Variable>,
	exportsByName: Map<string, Variable>,
	exportNamesByVariable: Map<Variable, string[]>
): void {
	for (const variable of getSortedExports(exports)) {
		let nameIndex = 0;
		let exportName = variable.name;
		while (exportsByName.has(exportName)) {
			exportName = variable.name + '$' + ++nameIndex;
		}
		exportsByName.set(exportName, variable);
		exportNamesByVariable.set(variable, [exportName]);
	}
}

function getSortedExports(exports: ReadonlySet<Variable>): Variable[] {
	return [...exports].sort(compareVariablesForExportNaming);
}

function compareVariablesForExportNaming(variableA: Variable, variableB: Variable): number {
	const moduleIdA = variableA.module?.id;
	const moduleIdB = variableB.module?.id;
	if (moduleIdA !== moduleIdB) {
		if (moduleIdA === undefined) return -1;
		if (moduleIdB === undefined) return 1;
		return moduleIdA < moduleIdB ? -1 : 1;
	}
	const declarationPositionA = getVariableDeclarationPosition(variableA);
	const declarationPositionB = getVariableDeclarationPosition(variableB);
	if (declarationPositionA !== declarationPositionB) {
		return declarationPositionA - declarationPositionB;
	}
	const baseNameA = getVariableBaseName(variableA);
	const baseNameB = getVariableBaseName(variableB);
	if (baseNameA !== baseNameB) {
		return baseNameA < baseNameB ? -1 : 1;
	}
	const exportKeyA = getVariableExportKey(variableA);
	const exportKeyB = getVariableExportKey(variableB);
	if (exportKeyA !== exportKeyB) {
		return exportKeyA < exportKeyB ? -1 : 1;
	}
	const constructorNameA = variableA.constructor.name;
	const constructorNameB = variableB.constructor.name;
	return constructorNameA < constructorNameB ? -1 : constructorNameA > constructorNameB ? 1 : 0;
}

function getVariableExportKey(variable: Variable): string {
	const module = variable.module;
	if (module && 'getExportNamesByVariable' in module) {
		const exportNames = module.getExportNamesByVariable().get(variable);
		if (exportNames?.length) {
			return exportNames.join('\0');
		}
	}
	return variable.name;
}

function getVariableDeclarationPosition(variable: Variable): number {
	const declarations = (variable as Variable & { declarations?: { start?: number }[] })
		.declarations;
	const start = declarations?.[0]?.start;
	return typeof start === 'number' ? start : Number.MAX_SAFE_INTEGER;
}

function getVariableBaseName(variable: Variable): string {
	return (
		(variable as Variable & { getBaseVariableName?: () => string }).getBaseVariableName?.() ??
		variable.name
	);
}
