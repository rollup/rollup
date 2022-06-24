import type Chunk from '../Chunk';
import { errFailedValidation, error } from './error';

// Four random characters from the private use area to minimize risk of conflicts
const hashPlaceholderLeft = '\uf7f9\ue4d3';
const hashPlaceholderRight = '\ue3cc\uf1fe';
const hashPlaceholderOverhead = hashPlaceholderLeft.length + hashPlaceholderRight.length;

// This is the size of a sha256
export const maxHashSize = 64;
export const defaultHashSize = 8;

export type HashPlaceholderGenerator = (
	chunk: Chunk,
	optionName: string,
	hashSize?: number
) => string;

export const getHashPlaceholderGenerator = (): {
	chunksByPlaceholder: Map<string, Chunk>;
	getHashPlaceholder: HashPlaceholderGenerator;
} => {
	const chunksByPlaceholder = new Map<string, Chunk>();
	let nextIndex = 0;
	return {
		chunksByPlaceholder,
		getHashPlaceholder: (chunk: Chunk, optionName: string, hashSize: number = defaultHashSize) => {
			if (hashSize > maxHashSize) {
				return error(
					errFailedValidation(
						`Hashes cannot be longer than ${maxHashSize} characters, received ${hashSize}. Check the "${optionName}" option.`
					)
				);
			}
			const placeholder = `${hashPlaceholderLeft}${String(++nextIndex).padStart(
				hashSize - hashPlaceholderOverhead,
				'0'
			)}${hashPlaceholderRight}`;
			if (placeholder.length > hashSize) {
				return error(
					errFailedValidation(
						`To generate hashes for this number of chunks (currently ${nextIndex}), you need a minimum hash size of ${placeholder.length}, received ${hashSize}. Check the "${optionName}" option.`
					)
				);
			}
			chunksByPlaceholder.set(placeholder, chunk);
			nextIndex++;
			return placeholder;
		}
	};
};

const REPLACER_REGEX = new RegExp(
	`${hashPlaceholderLeft}\\d{1,${maxHashSize - hashPlaceholderOverhead}}${hashPlaceholderRight}`,
	'g'
);

export const replacePlaceholders = (
	code: string,
	hashesByPlaceholder: Map<string, string>
): string =>
	code.replace(REPLACER_REGEX, placeholder => hashesByPlaceholder.get(placeholder) || placeholder);

export const replaceSinglePlaceholder = (
	code: string,
	placeholder: string,
	value: string
): string => code.replace(REPLACER_REGEX, match => (match === placeholder ? value : match));

export const replacePlaceholdersWithDefaultAndGetContainedPlaceholders = (
	code: string,
	placeholders: Map<string, Chunk>
): { containedPlaceholders: Set<string>; transformedCode: string } => {
	const containedPlaceholders = new Set<string>();
	const transformedCode = code.replace(REPLACER_REGEX, placeholder => {
		if (placeholders.has(placeholder)) {
			containedPlaceholders.add(placeholder);
			return `${hashPlaceholderLeft}${'0'.repeat(
				placeholder.length - hashPlaceholderOverhead
			)}${hashPlaceholderRight}`;
		}
		return placeholder;
	});
	return { containedPlaceholders, transformedCode };
};
