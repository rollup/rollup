import type { NormalizedOutputOptions } from '../rollup/types';
import RESERVED_NAMES from './RESERVED_NAMES';
import { stringifyObjectKeyIfNeeded, VALID_IDENTIFIER_REGEXP } from './identifierHelpers';

export interface GenerateCodeSnippets {
	_: string;
	cnst: string;
	n: string;
	s: string;
	getDirectReturnFunction(
		parameters: string[],
		options: {
			functionReturn: boolean;
			lineBreakIndent: { base: string; t: string } | null;
			name: string | null;
		}
	): [left: string, right: string];
	getDirectReturnIifeLeft(
		parameters: string[],
		returned: string,
		options: {
			needsArrowReturnParens: boolean | undefined;
			needsWrappedFunction: boolean | undefined;
		}
	): string;
	getFunctionIntro(
		parameters: string[],
		options: { isAsync: boolean; name: string | null }
	): string;
	getNonArrowFunctionIntro(
		parameters: string[],
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
		parameters,
		{ isAsync, name }
	) =>
		`${isAsync ? `async ` : ''}function${name ? ` ${name}` : ''}${_}(${parameters.join(
			`,${_}`
		)})${_}`;

	const getFunctionIntro: GenerateCodeSnippets['getFunctionIntro'] = arrowFunctions
		? (parameters, { isAsync, name }) => {
				const singleParameter = parameters.length === 1;
				const asyncString = isAsync ? `async${singleParameter ? ' ' : _}` : '';
				return `${name ? `${cnst} ${name}${_}=${_}` : ''}${asyncString}${
					singleParameter ? parameters[0] : `(${parameters.join(`,${_}`)})`
				}${_}=>${_}`;
			}
		: getNonArrowFunctionIntro;

	const getDirectReturnFunction: GenerateCodeSnippets['getDirectReturnFunction'] = (
		parameters,
		{ functionReturn, lineBreakIndent, name }
	) => [
		`${getFunctionIntro(parameters, {
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

	const isValidPropertyName = reservedNamesAsProps
		? (name: string): boolean => VALID_IDENTIFIER_REGEXP.test(name)
		: (name: string): boolean => !RESERVED_NAMES.has(name) && VALID_IDENTIFIER_REGEXP.test(name);

	return {
		_,
		cnst,
		getDirectReturnFunction,
		getDirectReturnIifeLeft: (
			parameters,
			returned,
			{ needsArrowReturnParens, needsWrappedFunction }
		) => {
			const [left, right] = getDirectReturnFunction(parameters, {
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
					const keyInObject = stringifyObjectKeyIfNeeded(key);
					return key === value && objectShorthand && key === keyInObject
						? prefix + key
						: `${prefix}${keyInObject}:${_}${value}`;
				})
				.join(`,`)}${
				fields.length === 0 ? '' : lineBreakIndent ? `${n}${lineBreakIndent.base}` : _
			}}`;
		},
		getPropertyAccess: (name: string): string =>
			isValidPropertyName(name) ? `.${name}` : `[${JSON.stringify(name)}]`,
		n,
		s
	};
}

const wrapIfNeeded = (code: string, needsParens: boolean | undefined): string =>
	needsParens ? `(${code})` : code;
