import type { LogHandler } from 'rollup';
import type { GlobalsOption } from '../../rollup/types';
import type { GenerateCodeSnippets } from '../../utils/generateCodeSnippets';
import { LOGLEVEL_WARN } from '../../utils/logging';
import { logReservedNamespace } from '../../utils/logs';

export default function setupNamespace(
	name: string,
	root: string,
	globals: GlobalsOption,
	{ _, getPropertyAccess, s }: GenerateCodeSnippets,
	compact: boolean | undefined,
	log?: LogHandler
): string {
	const parts = name.split('.');
	// Check if the key is exist in the prototype of the object
	const isReserved = parts[0] in {};
	if (log && isReserved) {
		log(LOGLEVEL_WARN, logReservedNamespace(parts[0]));
	}
	parts[0] =
		(typeof globals === 'function' ? globals(parts[0]) : isReserved ? null : globals[parts[0]]) ||
		parts[0];
	parts.pop();

	let propertyPath = root;
	return (
		parts
			.map(part => {
				propertyPath += getPropertyAccess(part);
				return `${propertyPath}${_}=${_}${propertyPath}${_}||${_}{}${s}`;
			})
			.join(compact ? ',' : '\n') + (compact && parts.length > 0 ? ';' : '\n')
	);
}

export function assignToDeepVariable(
	deepName: string,
	root: string,
	globals: GlobalsOption,
	assignment: string,
	{ _, getPropertyAccess }: GenerateCodeSnippets,
	log?: LogHandler
): string {
	const parts = deepName.split('.');
	// Check if the key is exist in the prototype of the object
	const isReserved = parts[0] in {};
	if (log && isReserved) {
		log(LOGLEVEL_WARN, logReservedNamespace(parts[0]));
	}
	parts[0] =
		(typeof globals === 'function' ? globals(parts[0]) : isReserved ? null : globals[parts[0]]) ||
		parts[0];
	const last = parts.pop()!;

	let propertyPath = root;
	let deepAssignment =
		[
			...parts.map(part => {
				propertyPath += getPropertyAccess(part);
				return `${propertyPath}${_}=${_}${propertyPath}${_}||${_}{}`;
			}),
			`${propertyPath}${getPropertyAccess(last)}`
		].join(`,${_}`) + `${_}=${_}${assignment}`;
	if (parts.length > 0) {
		deepAssignment = `(${deepAssignment})`;
	}
	return deepAssignment;
}
