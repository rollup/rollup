import { NormalizedOutputOptions } from '../rollup/types';
import { RESERVED_NAMES } from './reservedNames';

export interface GenerateCodeSnippets {
	_: string;
	cnst: string;
	n: string;
	s: string;
	getDirectReturnFunctionLeft(
		params: string[],
		options: {
			functionReturn: boolean;
			lineBreakIndent: string | false;
			name: string | null;
			t: string;
		}
	): string;
	getDirectReturnFunctionRight(options: { lineBreakIndent: string | false; name: boolean }): string;
	getDirectReturnIifeLeft(
		params: string[],
		returned: string,
		options: {
			needsArrowReturnParens: boolean | undefined;
			needsWrappedFunction: boolean | undefined;
		}
	): string;
	getFunctionIntro(params: string[], options: { isAsync: boolean; name: string | null }): string;
	getNonArrowFunctionIntro(
		params: string[],
		options: { isAsync: boolean; name: string | null }
	): string;
	// TODO Lukas adjust line-break handling with functions, change in System wrapper
	getObject(
		fields: [key: string | null, value: string][],
		options: { lineBreakIndent: string | false }
	): string;
	getPropertyAccess(name: string): string;
}

export function getGenerateCodeSnippets({
	compact,
	generatedCode: { arrowFunctions, constBindings, objectShorthand, reservedNamesAsProps }
}: NormalizedOutputOptions): GenerateCodeSnippets {
	const { _, n, s } = compact ? { _: '', n: '', s: '' } : { _: ' ', n: '\n', s: ';' };
	const cnst = constBindings ? 'const' : 'var';
	const getNonArrowFunctionIntro: GenerateCodeSnippets['getNonArrowFunctionIntro'] = (
		params,
		{ isAsync, name }
	) =>
		`${isAsync ? `async ` : ''}function${name ? ` ${name}` : ''}${_}(${params.join(`,${_}`)})${_}`;

	const getFunctionIntro: GenerateCodeSnippets['getFunctionIntro'] = arrowFunctions
		? (params, { isAsync, name }) => {
				const singleParam = params.length === 1;
				const asyncString = isAsync ? `async${singleParam ? ' ' : _}` : '';
				return `${name ? `${cnst} ${name}${_}=${_}` : ''}${asyncString}${
					singleParam ? params[0] : `(${params.join(`,${_}`)})`
				}${_}=>${_}`;
		  }
		: getNonArrowFunctionIntro;

	const getDirectReturnFunctionLeft: GenerateCodeSnippets['getDirectReturnFunctionLeft'] = (
		params,
		{ functionReturn, t, lineBreakIndent, name }
	) =>
		`${getFunctionIntro(params, {
			isAsync: false,
			name
		})}${
			arrowFunctions
				? lineBreakIndent
					? `${n}${lineBreakIndent}${t}`
					: ''
				: `{${lineBreakIndent ? `${n}${lineBreakIndent}${t}` : _}${functionReturn ? 'return ' : ''}`
		}`;

	const getDirectReturnFunctionRight: GenerateCodeSnippets['getDirectReturnFunctionRight'] = ({
		lineBreakIndent,
		name
	}) =>
		arrowFunctions
			? `${name ? ';' : ''}${lineBreakIndent ? `${n}${lineBreakIndent}` : ''}`
			: `${s}${lineBreakIndent ? `${n}${lineBreakIndent}` : _}}`;

	const isValidPropName = reservedNamesAsProps
		? (name: string): boolean => validPropName.test(name)
		: (name: string): boolean => !RESERVED_NAMES[name] && validPropName.test(name);

	return {
		_,
		cnst,
		getDirectReturnFunctionLeft,
		getDirectReturnFunctionRight,
		getDirectReturnIifeLeft: (params, returned, { needsArrowReturnParens, needsWrappedFunction }) =>
			`${wrapIfNeeded(
				`${getDirectReturnFunctionLeft(params, {
					functionReturn: true,
					lineBreakIndent: false,
					name: null,
					t: ''
				})}${wrapIfNeeded(
					returned,
					arrowFunctions && needsArrowReturnParens
				)}${getDirectReturnFunctionRight({ lineBreakIndent: false, name: false })}`,
				arrowFunctions || needsWrappedFunction
			)}(`,
		getFunctionIntro,
		getNonArrowFunctionIntro,
		getObject(fields, { lineBreakIndent }) {
			const prefix = lineBreakIndent === false ? _ : `${n}${lineBreakIndent}`;
			return `{${fields
				.map(([key, value]) => {
					if (key === null) return `${prefix}${value}`;
					const needsQuotes = !isValidPropName(key);
					return key === value && objectShorthand && !needsQuotes
						? prefix + key
						: `${prefix}${needsQuotes ? `'${key}'` : key}:${_}${value}`;
				})
				.join(`,`)}${fields.length === 0 ? '' : lineBreakIndent === false ? _ : n}}`;
		},
		getPropertyAccess: (name: string): string =>
			isValidPropName(name) ? `.${name}` : `[${JSON.stringify(name)}]`,
		n,
		s
	};
}

const wrapIfNeeded = (code: string, needsParens: boolean | undefined): string =>
	needsParens ? `(${code})` : code;

const validPropName = /^(?!\d)[\w$]+$/;
