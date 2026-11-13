import type MagicString from 'magic-string';
import * as NodeType from '../ast/nodes/NodeType';
import type Variable from '../ast/variables/Variable';
import { unescapeExportName } from './exportNames';
import type { RenderOptions } from './renderHelpers';

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
		return `exports(${JSON.stringify(
			unescapeExportName(exportNamesByVariable.get(variable)![0])
		)},${_}${variable.getName(getPropertyAccess)}${modifier})`;
	} else {
		const fields: [key: string, value: string][] = [];
		for (const variable of exportedVariables) {
			for (const exportName of exportNamesByVariable.get(variable)!) {
				fields.push([
					unescapeExportName(exportName),
					variable.getName(getPropertyAccess) + modifier
				]);
			}
		}
		return `exports(${getObject(fields, { lineBreakIndent: null })})`;
	}
}

// This is only invoked if there is exactly one export name
export function renderSystemExportExpression(
	exportedVariable: Variable,
	expressionStart: number,
	expressionEnd: number,
	code: MagicString,
	{ exportNamesByVariable, snippets: { _ } }: RenderOptions
): void {
	code.prependRight(
		expressionStart,
		`exports(${JSON.stringify(unescapeExportName(exportNamesByVariable.get(exportedVariable)![0]))},${_}`
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

export function renderSystemExportForLoop(
	left: {
		addExportedVariables(
			variables: readonly Variable[],
			exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
		): void;
	},
	body: {
		end: number;
		scope: { variables: ReadonlyMap<string, Variable> };
		start: number;
		type: string;
	},
	code: MagicString,
	options: RenderOptions
): void {
	const exportedVariables: Variable[] = [];
	left.addExportedVariables(exportedVariables, options.exportNamesByVariable);
	if (exportedVariables.length === 0) return;

	const { _, getPropertyAccess } = options.snippets;
	const exportStatement = `${getSystemExportStatement(exportedVariables, options)};`;
	if (body.type === NodeType.EmptyStatement) {
		code.overwrite(body.start, body.end, exportStatement);
	} else if (
		body.type === NodeType.BlockStatement &&
		!scopeShadowsExportedBindings(body.scope, exportedVariables, getPropertyAccess)
	) {
		code.prependRight(body.start + 1, `${_}${exportStatement}`);
	} else {
		code.prependRight(body.start, `{${_}${exportStatement}${_}`);
		code.appendLeft(body.end, `${_}}`);
	}
}

function scopeShadowsExportedBindings(
	scope: { variables: ReadonlyMap<string, Variable> },
	exportedVariables: readonly Variable[],
	getPropertyAccess: RenderOptions['snippets']['getPropertyAccess']
): boolean {
	const referencedNames = new Set<string>(['exports']);
	for (const variable of exportedVariables) {
		referencedNames.add(variable.getName(getPropertyAccess));
	}
	for (const variable of scope.variables.values()) {
		if (variable.included && referencedNames.has(variable.getName(getPropertyAccess))) {
			return true;
		}
	}
	return false;
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
