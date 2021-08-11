import MagicString from 'magic-string';
import { NormalizedOutputOptions } from '../rollup/types';

export interface GenerateCodeSnippets {
	_: string;
	n: string;
	s: string;
	t: string;
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

// TODO Lukas varOrConst
export function getGenerateCodeSnippets(
	{ compact, generatedCode: { arrowFunctions } }: NormalizedOutputOptions,
	indentString: string
): GenerateCodeSnippets {
	const { _, n, s } = compact ? { _: '', n: '', s: '' } : { _: ' ', n: '\n', s: ';' };
	return {
		_,
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
						`(${
							params.length === 1 ? params[0] : `(${params.join(`,${_}`)})`
						}${_}=>${_}${wrapIfNeeded(returned, needsArrowReturnParens)})(`
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
						`function${_}(${params.join(`,${_}`)})${_}{${_}return ${returned}${s}${_}}(`
					);
					code.appendLeft(argEnd, ')');
					if (needsWrappedFunction) {
						code.prependRight(argStart, '(');
						code.appendLeft(argEnd, ')');
					}
			  },
		s,
		t: indentString
	};
}

export function wrapIfNeeded(code: string, needsParens: boolean | undefined): string {
	return needsParens ? `(${code})` : code;
}
