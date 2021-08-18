import MagicString from 'magic-string';
import { NormalizedOutputOptions } from '../rollup/types';
import { RESERVED_NAMES } from './reservedNames';

export interface GenerateCodeSnippets {
	_: string;
	directReturnFunctionRight: string;
	n: string;
	s: string;
	getDirectReturnFunctionLeft(params: string[], options: { functionReturn: boolean }): string;
	getFunctionIntro(params: string[], isAsync?: boolean): string;
	getObject(
		fields: [key: string | null, value: string][],
		options: { indent: string; lineBreaks: boolean }
	): string;
	getPropertyAccess(name: string): string;
	renderDirectReturnIife(
		params: string[],
		returned: string,
		code: MagicString,
		argStart: number,
		argEnd: number,
		options: {
			needsArrowReturnParens: boolean | undefined;
			needsWrappedFunction: boolean | undefined;
		}
	): void;
}

export function getGenerateCodeSnippets({
	compact,
	generatedCode: { arrowFunctions, objectShorthand, reservedNamesAsProps }
}: NormalizedOutputOptions): GenerateCodeSnippets {
	const { _, n, s } = compact ? { _: '', n: '', s: '' } : { _: ' ', n: '\n', s: ';' };

	const getFunctionIntro: GenerateCodeSnippets['getFunctionIntro'] = arrowFunctions
		? (params, isAsync) => {
				const singleParam = params.length === 1;
				const asyncString = isAsync ? `async${singleParam ? ' ' : _}` : '';
				return `${asyncString}${singleParam ? params[0] : `(${params.join(`,${_}`)})`}${_}=>${_}`;
		  }
		: (params, isAsync) => `${isAsync ? `async ` : ''}function${_}(${params.join(`,${_}`)})${_}`;

	const getDirectReturnFunctionLeft: GenerateCodeSnippets['getDirectReturnFunctionLeft'] = (
		params,
		{ functionReturn }
	) =>
		`${getFunctionIntro(params)}${arrowFunctions ? '' : `{${_}${functionReturn ? 'return ' : ''}`}`;

	const directReturnFunctionRight = arrowFunctions ? '' : `${s}${_}}`;

	const isValidPropName = reservedNamesAsProps
		? (name: string): boolean => validPropName.test(name)
		: (name: string): boolean => !RESERVED_NAMES[name] && validPropName.test(name);

	return {
		_,
		directReturnFunctionRight,
		getDirectReturnFunctionLeft,
		getFunctionIntro,
		getObject(fields, { indent, lineBreaks }) {
			const prefix = `${lineBreaks ? n : ''}${indent}`;
			return `{${fields
				.map(([key, value]) => {
					if (key === null) return `${prefix}${value}`;
					const needsQuotes = !isValidPropName(key);
					return key === value && objectShorthand && !needsQuotes
						? prefix + key
						: `${prefix}${needsQuotes ? `'${key}'` : key}:${_}${value}`;
				})
				.join(`,`)}${fields.length === 0 ? '' : lineBreaks ? n : indent}}`;
		},
		getPropertyAccess: (name: string): string =>
			isValidPropName(name) ? `.${name}` : `[${JSON.stringify(name)}]`,
		n,
		renderDirectReturnIife: (
			params,
			returned,
			code,
			argStart,
			argEnd,
			{ needsArrowReturnParens, needsWrappedFunction }
		) => {
			code.prependRight(
				argStart,
				`${wrapIfNeeded(
					`${getDirectReturnFunctionLeft(params, { functionReturn: true })}${wrapIfNeeded(
						returned,
						arrowFunctions && needsArrowReturnParens
					)}${directReturnFunctionRight}`,
					arrowFunctions || needsWrappedFunction
				)}(`
			);
			code.appendLeft(argEnd, ')');
		},
		s
	};
}

const wrapIfNeeded = (code: string, needsParens: boolean | undefined): string =>
	needsParens ? `(${code})` : code;

const validPropName = /^(?!\d)[\w$]+$/;
