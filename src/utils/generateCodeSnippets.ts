import MagicString from 'magic-string';
import { NormalizedOutputOptions } from '../rollup/types';

export interface GenerateCodeSnippets {
	_: string;
	n: string;
	s: string;
	getFunctionIntro(params: string[]): string;
	// TODO Lukas pass the arg to be rendered instead
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
	generatedCode: { arrowFunctions }
}: NormalizedOutputOptions): GenerateCodeSnippets {
	const { _, n, s } = compact ? { _: '', n: '', s: '' } : { _: ' ', n: '\n', s: ';' };
	const getFunctionIntro = arrowFunctions
		? (params: string[]) =>
				`${params.length === 1 ? params[0] : `(${params.join(`,${_}`)})`}${_}=>${_}`
		: (params: string[]) => `function${_}(${params.join(`,${_}`)})${_}`;

	return {
		_,
		getFunctionIntro,
		n,
		renderDirectReturnIife: arrowFunctions
			? (
					params: string[],
					returned: string,
					code: MagicString,
					argStart: number,
					argEnd: number,
					{ needsArrowReturnParens }
			  ) => {
					code.prependRight(
						argStart,
						`(${getFunctionIntro(params)}${wrapIfNeeded(returned, needsArrowReturnParens)})(`
					);
					code.appendLeft(argEnd, ')');
			  }
			: (
					params: string[],
					returned: string,
					code: MagicString,
					argStart: number,
					argEnd: number,
					{ needsWrappedFunction }
			  ) => {
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
