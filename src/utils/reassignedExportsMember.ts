import type Variable from '../ast/variables/Variable';

export function isReassignedExportsMember(
	variable: Variable,
	exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
): boolean {
	return (
		variable.renderBaseName !== null && exportNamesByVariable.has(variable) && variable.isReassigned
	);
}
