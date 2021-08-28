import { NormalizedOutputOptions } from '../rollup/types';
import { RESERVED_NAMES } from './reservedNames';

export interface GenerateCodeSnippets {
	_: string;
	directReturnFunctionRight: string;
	n: string;
	namedDirectReturnFunctionRight: string;
	s: string;
	getDirectReturnFunctionLeft(
		params: string[],
		options: { functionReturn: boolean; name: string | null }
	): string;
	getDirectReturnIifeLeft(
		params: string[],
		returned: string,
		options: {
			needsArrowReturnParens: boolean | undefined;
			needsWrappedFunction: boolean | undefined;
		}
	): string;
	getFunctionIntro(params: string[], options: { isAsync: boolean; name: string | null }): string;
	getObject(
		fields: [key: string | null, value: string][],
		options: { indent: string; lineBreaks: boolean }
	): string;
	getPropertyAccess(name: string): string;
}

export function getGenerateCodeSnippets({
	compact,
	generatedCode: { arrowFunctions, objectShorthand, reservedNamesAsProps }
}: NormalizedOutputOptions): GenerateCodeSnippets {
	const { _, n, s } = compact ? { _: '', n: '', s: '' } : { _: ' ', n: '\n', s: ';' };

	// TODO Lukas use const
	const getFunctionIntro: GenerateCodeSnippets['getFunctionIntro'] = arrowFunctions
		? (params, { isAsync, name }) => {
				const singleParam = params.length === 1;
				const asyncString = isAsync ? `async${singleParam ? ' ' : _}` : '';
				return `${name ? `var ${name}${_}=${_}` : ''}${asyncString}${
					singleParam ? params[0] : `(${params.join(`,${_}`)})`
				}${_}=>${_}`;
		  }
		: (params, { isAsync, name }) =>
				`${isAsync ? `async ` : ''}function${name ? ` ${name}` : ''}${_}(${params.join(
					`,${_}`
				)})${_}`;

	const getDirectReturnFunctionLeft: GenerateCodeSnippets['getDirectReturnFunctionLeft'] = (
		params,
		{ functionReturn, name }
	) =>
		`${getFunctionIntro(params, {
			isAsync: false,
			name
		})}${arrowFunctions ? '' : `{${_}${functionReturn ? 'return ' : ''}`}`;

	const directReturnFunctionRight = arrowFunctions ? '' : `${s}${_}}`;

	const isValidPropName = reservedNamesAsProps
		? (name: string): boolean => validPropName.test(name)
		: (name: string): boolean => !RESERVED_NAMES[name] && validPropName.test(name);

	return {
		_,
		directReturnFunctionRight,
		getDirectReturnFunctionLeft,
		getDirectReturnIifeLeft: (params, returned, { needsArrowReturnParens, needsWrappedFunction }) =>
			`${wrapIfNeeded(
				`${getDirectReturnFunctionLeft(params, {
					functionReturn: true,
					name: null
				})}${wrapIfNeeded(
					returned,
					arrowFunctions && needsArrowReturnParens
				)}${directReturnFunctionRight}`,
				arrowFunctions || needsWrappedFunction
			)}(`,
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
		namedDirectReturnFunctionRight: `${directReturnFunctionRight}${arrowFunctions ? ';' : ''}`,
		s
	};
}

const wrapIfNeeded = (code: string, needsParens: boolean | undefined): string =>
	needsParens ? `(${code})` : code;

const validPropName = /^(?!\d)[\w$]+$/;
