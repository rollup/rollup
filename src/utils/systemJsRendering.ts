import MagicString from 'magic-string';
import Variable from '../ast/variables/Variable';
import { RenderOptions } from './renderHelpers';

export function getSystemExportStatement(
	exportedVariables: Variable[],
	{ compact, exportNamesByVariable }: RenderOptions,
	modifier = ''
): string {
	const _ = compact ? '' : ' ';
	if (
		exportedVariables.length === 1 &&
		exportNamesByVariable.get(exportedVariables[0])!.length === 1
	) {
		const variable = exportedVariables[0];
		return `exports('${exportNamesByVariable.get(variable)}',${_}${variable.getName()}${modifier})`;
	} else {
		return `exports({${_}${exportedVariables
			.map(variable => {
				return exportNamesByVariable
					.get(variable)!
					.map(exportName => `${exportName}:${_}${variable.getName()}${modifier}`)
					.join(`,${_}`);
			})
			.join(`,${_}`)}${_}})`;
	}
}

export function renderSystemExportExpression(
	exportedVariable: Variable,
	expressionStart: number,
	expressionEnd: number,
	code: MagicString,
	{ compact, exportNamesByVariable }: RenderOptions
): void {
	const _ = compact ? '' : ' ';
	code.prependRight(
		expressionStart,
		`exports('${exportNamesByVariable.get(exportedVariable)}',${_}`
	);
	code.appendLeft(expressionEnd, ')');
}

export function renderSystemExportFunction(
	exportedVariables: Variable[],
	expressionStart: number,
	expressionEnd: number,
	needsParens: boolean | undefined,
	code: MagicString,
	options: RenderOptions
): void {
	const _ = options.compact ? '' : ' ';
	const s = options.compact ? '' : ';';
	code.prependRight(
		expressionStart,
		`function${_}(v)${_}{${_}return ${getSystemExportStatement(
			exportedVariables,
			options
		)},${_}v${s}${_}}(`
	);
	code.appendLeft(expressionEnd, ')');
	if (needsParens) {
		code.prependRight(expressionStart, '(');
		code.appendLeft(expressionEnd, ')');
	}
}

export function renderSystemExportSequenceAfterExpression(
	exportedVariable: Variable,
	expressionStart: number,
	expressionEnd: number,
	needsParens: boolean | undefined,
	code: MagicString,
	options: RenderOptions
): void {
	const _ = options.compact ? '' : ' ';
	code.appendLeft(
		expressionEnd,
		`,${_}${getSystemExportStatement(
			[exportedVariable],
			options
		)},${_}${exportedVariable.getName()}`
	);
	if (needsParens) {
		code.prependRight(expressionStart, '(');
		code.appendLeft(expressionEnd, ')');
	}
}

export function renderSystemExportSequenceBeforeExpression(
	exportedVariable: Variable,
	expressionStart: number,
	expressionEnd: number,
	needsParens: boolean | undefined,
	code: MagicString,
	options: RenderOptions,
	modifier: string
): void {
	const _ = options.compact ? '' : ' ';
	code.prependRight(
		expressionStart,
		`${getSystemExportStatement([exportedVariable], options, modifier)},${_}`
	);
	if (needsParens) {
		code.prependRight(expressionStart, '(');
		code.appendLeft(expressionEnd, ')');
	}
}
