import { NormalizedOutputOptions } from '../rollup/types';
import { RESERVED_NAMES } from './reservedNames';

export interface GenerateCodeSnippets {
	_: string;
	cnst: string;
	n: string;
	s: string;
	getDirectReturnFunction(
		params: string[],
		options: {
			functionReturn: boolean;
			lineBreakIndent: { base: string; t: string } | null;
			name: string | null;
		}
	): [left: string, right: string];
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
	getObject(
		fields: [key: string | null, value: string][],
		options: { lineBreakIndent: { base: string; t: string } | null }
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

	const getDirectReturnFunction: GenerateCodeSnippets['getDirectReturnFunction'] = (
		params,
		{ functionReturn, lineBreakIndent, name }
	) => [
		`${getFunctionIntro(params, {
			isAsync: false,
			name
		})}${
			arrowFunctions
				? lineBreakIndent
					? `${n}${lineBreakIndent.base}${lineBreakIndent.t}`
					: ''
				: `{${lineBreakIndent ? `${n}${lineBreakIndent.base}${lineBreakIndent.t}` : _}${
						functionReturn ? 'return ' : ''
				  }`
		}`,
		arrowFunctions
			? `${name ? ';' : ''}${lineBreakIndent ? `${n}${lineBreakIndent.base}` : ''}`
			: `${s}${lineBreakIndent ? `${n}${lineBreakIndent.base}` : _}}`
	];

	const isValidPropName = reservedNamesAsProps
		? (name: string): boolean => validPropName.test(name)
		: (name: string): boolean => !RESERVED_NAMES.has(name) && validPropName.test(name);

	return {
		_,
		cnst,
		getDirectReturnFunction,
		getDirectReturnIifeLeft: (
			params,
			returned,
			{ needsArrowReturnParens, needsWrappedFunction }
		) => {
			const [left, right] = getDirectReturnFunction(params, {
				functionReturn: true,
				lineBreakIndent: null,
				name: null
			});
			return `${wrapIfNeeded(
				`${left}${wrapIfNeeded(returned, arrowFunctions && needsArrowReturnParens)}${right}`,
				arrowFunctions || needsWrappedFunction
			)}(`;
		},
		getFunctionIntro,
		getNonArrowFunctionIntro,
		getObject(fields, { lineBreakIndent }) {
			const prefix = lineBreakIndent ? `${n}${lineBreakIndent.base}${lineBreakIndent.t}` : _;
			return `{${fields
				.map(([key, value]) => {
					if (key === null) return `${prefix}${value}`;
					const needsQuotes = !isValidPropName(key);
					return key === value && objectShorthand && !needsQuotes
						? prefix + key
						: `${prefix}${needsQuotes ? `'${key}'` : key}:${_}${value}`;
				})
				.join(`,`)}${
				fields.length === 0 ? '' : lineBreakIndent ? `${n}${lineBreakIndent.base}` : _
			}}`;
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
