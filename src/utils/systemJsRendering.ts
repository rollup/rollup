import Variable from '../ast/variables/Variable';

export function getSystemExportStatement(exportedVariables: Variable[]): string {
	if (exportedVariables.length === 1 && exportedVariables[0].exportName && exportedVariables[0].exportName.length === 1) {
		return `exports('${exportedVariables[0].safeExportName ||
			exportedVariables[0].exportName[0]}', ${exportedVariables[0].getName()})`;
	} else {
		return `exports({ ${exportedVariables
			.map(variable =>
				// TODO: do we always have export names at this point?
				variable.exportName!.map(exportName => `${exportName}: ${variable.getName()}`)
				.join(', ')
			)
			.join(', ')} })`;
	}
}
