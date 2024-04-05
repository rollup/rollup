import { EMPTY_ARRAY } from './blank';
import FIXED_STRINGS from './convert-ast-strings';
import type { ReadString } from './getReadStringFunction';

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
	const list: any[] = [];
	for (let index = 0; index < length; index++) {
		list.push(convertAnnotation(buffer[position++], buffer));
	}
	return list;
};

const convertAnnotation = (position: number, buffer: Uint32Array): RollupAnnotation => {
	const start = buffer[position++];
	const end = buffer[position++];
	const type = FIXED_STRINGS[buffer[position]] as AnnotationType;
	return { end, start, type };
};

export const convertString = (
	position: number,
	buffer: Uint32Array,
	readString: ReadString
): string => {
	const length = buffer[position++];
	const bytePosition = position << 2;
	return readString(bytePosition, length);
};
