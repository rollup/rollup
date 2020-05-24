import Variable from '../ast/variables/Variable';
import { RenderOptions } from './renderHelpers';

export function getSystemExportStatement(
	exportedVariables: Variable[],
	options: RenderOptions
): string {
	const _ = options.compact ? '' : ' ';
	if (
		exportedVariables.length === 1 &&
		(exportedVariables[0].safeExportName || exportedVariables[0].exportName?.length === 1)
	) {
		return `exports('${
			exportedVariables[0].safeExportName || exportedVariables[0].exportName![0]
		}',${_}${exportedVariables[0].getName()})`;
	} else {
		return `exports({${exportedVariables
			.map(variable => {
				if (variable.safeExportName) return `${variable.safeExportName}:${_}${variable.getName()}`;
				return variable
					.exportName!.map(exportName => `${exportName}:${_}${variable.getName()}`)
					.join(`,${_}`);
			})
			.join(`,${_}`)}})`;
	}
}
