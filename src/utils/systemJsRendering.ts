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
		const variable = exportedVariables[0];
		return `exports('${options.exportNamesByVariable.get(variable)}',${_}${variable.getName()})`;
	} else {
		return `exports({${_}${exportedVariables
			.map(variable => {
				return options.exportNamesByVariable
					.get(variable)!
					.map(exportName => `${exportName}:${_}${variable.getName()}`)
					.join(`,${_}`);
			})
			.join(`,${_}`)}${_}})`;
	}
}

export function getSystemExportFunctionLeft(
	exportedVariables: Variable[],
	setFromExpression: boolean,
	options: RenderOptions
): string {
	const _ = options.compact ? '' : ' ';
	const s = options.compact ? '' : ';';
	return `function${_}(v)${_}{${_}return exports({${_}${exportedVariables
		.map(variable => {
			return options.exportNamesByVariable
				.get(variable)!
				.map(exportName => `${exportName}:${_}${setFromExpression ? variable.getName() : 'v'}`)
				.join(`,${_}`);
		})
		.join(`,${_}`)}${_}}),${_}v${s}${_}}(`;
}
