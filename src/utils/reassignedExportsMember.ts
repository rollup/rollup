import type Variable from '../ast/variables/Variable';

export function isReassignedExportsMember(
	variable: Variable,
	exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
): boolean {
	return (
		variable.renderBaseName !== null && exportNamesByVariable.has(variable) && variable.isReassigned
	);
}

export function isDeclaredWithoutBinding(
	variable: Variable | null | undefined,
	exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
): boolean {
	if (!variable) return false;
	if (isReassignedExportsMember(variable, exportNamesByVariable)) return true;
	const hoistedVariable = variable.getHoistedVariable();
	return hoistedVariable !== undefined && hoistedVariable.renderBaseName !== null;
}
