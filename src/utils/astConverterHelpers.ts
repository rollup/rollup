import { EMPTY_ARRAY } from './blank';
import FIXED_STRINGS from './convert-ast-strings';

export const ANNOTATION_KEY = '_rollupAnnotations';
export const INVALID_ANNOTATION_KEY = '_rollupRemoved';

export type AnnotationType = 'pure' | 'noSideEffects';

export interface RollupAnnotation {
	start: number;
	end: number;
	type: AnnotationType;
}

export const convertAnnotations = (
	position: number,
	buffer: Uint32Array
): readonly RollupAnnotation[] => {
	if (position === 0) return EMPTY_ARRAY;
	const length = buffer[position++];
	const list: any[] = new Array(length);
	for (let index = 0; index < length; index++) {
		list[index] = convertAnnotation(buffer[position++], buffer);
	}
	return list;
};

const convertAnnotation = (position: number, buffer: Uint32Array): RollupAnnotation => {
	const start = buffer[position++];
	const end = buffer[position++];
	const type = FIXED_STRINGS[buffer[position]] as AnnotationType;
	return { end, start, type };
};
