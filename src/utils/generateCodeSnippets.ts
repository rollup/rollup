import MagicString from 'magic-string';
import { NormalizedOutputOptions } from '../rollup/types';

export interface GenerateCodeSnippets {
	_: string;
	n: string;
	s: string;
	getFunctionIntro(params: string[], isAsync?: boolean): string;
	getObject(fields: [key: string, value: string][]): string;
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
	generatedCode: { arrowFunctions, objectShorthand }
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

	return {
		_,
		getFunctionIntro,
		getObject: fields =>
			`{${_}${fields
				.map(([key, value]) => (objectShorthand && key === value ? key : `${key}:${_}${value}`))
				.join(`,${_}`)}${_}}`,
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

export function wrapIfNeeded(code: string, needsParens: boolean | undefined): string {
	return needsParens ? `(${code})` : code;
}
