import type { ast } from '../rollup/types';
import { EMPTY_ARRAY } from './blank';
import FIXED_STRINGS from './convert-ast-strings';

export const ANNOTATION_KEY = 'annotations';
export const INVALID_ANNOTATION_KEY = 'invalidAnnotations';

export const convertAnnotations = (
	position: number,
	buffer: Uint32Array
): readonly ast.Annotation[] => {
	if (position === 0) return EMPTY_ARRAY;
	const length = buffer[position++];
	const list: any[] = new Array(length);
	for (let index = 0; index < length; index++) {
		list[index] = convertAnnotation(buffer[position++], buffer);
	}
	return list;
};

const convertAnnotation = (position: number, buffer: Uint32Array): ast.Annotation => {
	const start = buffer[position++];
	const end = buffer[position++];
	const type = FIXED_STRINGS[buffer[position]] as ast.AnnotationType;
	return { end, start, type };
};
