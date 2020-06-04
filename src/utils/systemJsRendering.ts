import Variable from '../ast/variables/Variable';
import { RenderOptions } from './renderHelpers';

export function getSystemExportStatement(
	exportedVariables: Variable[],
	options: RenderOptions
): string {
	const _ = options.compact ? '' : ' ';
	if (
		exportedVariables.length === 1 &&
		options.exportNamesByVariable.get(exportedVariables[0])!.length === 1
	) {
		return `exports('${options.exportNamesByVariable.get(
			exportedVariables[0]
		)}',${_}${exportedVariables[0].getName()})`;
	} else {
		return `exports({${exportedVariables
			.map(variable => {
				return options.exportNamesByVariable
					.get(variable)!
					.map(exportName => `${exportName}:${_}${variable.getName()}`)
					.join(`,${_}`);
			})
			.join(`,${_}`)}})`;
	}
}
