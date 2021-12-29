import MagicString from 'magic-string';
import Variable from '../ast/variables/Variable';
import { RenderOptions } from './renderHelpers';

export function getSystemExportStatement(
	exportedVariables: readonly Variable[],
	{ exportNamesByVariable, snippets: { _, getObject, getPropertyAccess } }: RenderOptions,
	modifier = ''
): string {
	if (
		exportedVariables.length === 1 &&
		exportNamesByVariable.get(exportedVariables[0])!.length === 1
	) {
		const variable = exportedVariables[0];
		return `exports('${exportNamesByVariable.get(variable)}',${_}${variable.getName(
			getPropertyAccess
		)}${modifier})`;
	} else {
		const fields: [key: string, value: string][] = [];
		for (const variable of exportedVariables) {
			for (const exportName of exportNamesByVariable.get(variable)!) {
				fields.push([exportName, variable.getName(getPropertyAccess) + modifier]);
			}
		}
		return `exports(${getObject(fields, { lineBreakIndent: null })})`;
	}
}

export function renderSystemExportExpression(
	exportedVariable: Variable,
	expressionStart: number,
	expressionEnd: number,
	code: MagicString,
	{ exportNamesByVariable, snippets: { _ } }: RenderOptions
): void {
	code.prependRight(
		expressionStart,
		`exports('${exportNamesByVariable.get(exportedVariable)}',${_}`
	);
	code.appendLeft(expressionEnd, ')');
}

export function renderSystemExportFunction(
	exportedVariables: readonly Variable[],
	expressionStart: number,
	expressionEnd: number,
	needsParens: boolean | undefined,
	code: MagicString,
	options: RenderOptions
): void {
	const { _, getDirectReturnIifeLeft } = options.snippets;
	code.prependRight(
		expressionStart,
		getDirectReturnIifeLeft(
			['v'],
			`${getSystemExportStatement(exportedVariables, options)},${_}v`,
			{ needsArrowReturnParens: true, needsWrappedFunction: needsParens }
		)
	);
	code.appendLeft(expressionEnd, ')');
}

export function renderSystemExportSequenceAfterExpression(
	exportedVariable: Variable,
	expressionStart: number,
	expressionEnd: number,
	needsParens: boolean | undefined,
	code: MagicString,
	options: RenderOptions
): void {
	const { _, getPropertyAccess } = options.snippets;
	code.appendLeft(
		expressionEnd,
		`,${_}${getSystemExportStatement([exportedVariable], options)},${_}${exportedVariable.getName(
			getPropertyAccess
		)}`
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
	const { _ } = options.snippets;
	code.prependRight(
		expressionStart,
		`${getSystemExportStatement([exportedVariable], options, modifier)},${_}`
	);
	if (needsParens) {
		code.prependRight(expressionStart, '(');
		code.appendLeft(expressionEnd, ')');
	}
}
