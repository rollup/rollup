import Variable from '../ast/variables/Variable';

export function getSystemExportStatement(exportedVariables: Variable[]): string {
	if (exportedVariables.length === 1) {
		return `exports('${exportedVariables[0].safeExportName ||
			exportedVariables[0].exportName}', ${exportedVariables[0].getName()});`;
	} else {
		return `exports({${exportedVariables
			.map(variable => `${variable.safeExportName || variable.exportName}: ${variable.getName()}`)
			.join(', ')}});`;
	}
}
