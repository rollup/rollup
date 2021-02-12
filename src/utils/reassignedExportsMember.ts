import Variable from '../ast/variables/Variable';

export function isReassignedExportsMember(
	variable: Variable,
	exportNamesByVariable: Map<Variable, string[]>
): boolean {
	return (
		variable.renderBaseName !== null && exportNamesByVariable.has(variable) && variable.isReassigned
	);
}
