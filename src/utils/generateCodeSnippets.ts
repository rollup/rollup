import MagicString from 'magic-string';
import { NormalizedOutputOptions } from '../rollup/types';
import { RESERVED_NAMES } from './reservedNames';

export interface GenerateCodeSnippets {
	_: string;
	n: string;
	s: string;
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
	const getFunctionIntro = arrowFunctions
		? (params: string[], isAsync?: boolean) => {
				const singleParam = params.length === 1;
				const asyncString = isAsync ? `async${singleParam ? ' ' : _}` : '';
				return `${asyncString}${singleParam ? params[0] : `(${params.join(`,${_}`)})`}${_}=>${_}`;
		  }
		: (params: string[], isAsync?: boolean) =>
				`${isAsync ? `async ` : ''}function${_}(${params.join(`,${_}`)})${_}`;

	const isValidPropName = reservedNamesAsProps
		? (name: string): boolean => validPropName.test(name)
		: (name: string): boolean => !RESERVED_NAMES[name] && validPropName.test(name);

	return {
		_,
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
				.join(`,`)}${lineBreaks ? n : indent}}`;
		},
		getPropertyAccess: (name: string): string =>
			isValidPropName(name) ? `.${name}` : `[${JSON.stringify(name)}]`,
		n,
		renderDirectReturnIife: arrowFunctions
			? (params, returned, code, argStart, argEnd, { needsArrowReturnParens }) => {
					code.prependRight(
						argStart,
						`(${getFunctionIntro(params)}${wrapIfNeeded(returned, needsArrowReturnParens)})(`
					);
					code.appendLeft(argEnd, ')');
			  }
			: (params, returned, code, argStart, argEnd, { needsWrappedFunction }) => {
					code.prependRight(
						argStart,
						`${getFunctionIntro(params)}{${_}return ${returned}${s}${_}}(`
					);
					code.appendLeft(argEnd, ')');
					if (needsWrappedFunction) {
						code.prependRight(argStart, '(');
						code.appendLeft(argEnd, ')');
					}
			  },
		s
	};
}

const wrapIfNeeded = (code: string, needsParens: boolean | undefined): string =>
	needsParens ? `(${code})` : code;

const validPropName = /^(?!\d)[\w$]+$/;
