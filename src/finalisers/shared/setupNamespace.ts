import { GlobalsOption } from '../../rollup/types';
import { GenerateCodeSnippets } from '../../utils/generateCodeSnippets';

export default function setupNamespace(
	name: string,
	root: string,
	globals: GlobalsOption,
	{ _, getPropertyAccess, s }: GenerateCodeSnippets,
	compact: boolean | undefined
): string {
	const parts = name.split('.');
	parts[0] = (typeof globals === 'function' ? globals(parts[0]) : globals[parts[0]]) || parts[0];
	parts.pop();

	let propertyPath = root;
	return (
		parts
			.map(part => {
				propertyPath += getPropertyAccess(part);
				return `${propertyPath}${_}=${_}${propertyPath}${_}||${_}{}${s}`;
			})
			.join(compact ? ',' : '\n') + (compact && parts.length ? ';' : '\n')
	);
}

export function assignToDeepVariable(
	deepName: string,
	root: string,
	globals: GlobalsOption,
	assignment: string,
	{ _, getPropertyAccess }: GenerateCodeSnippets
): string {
	const parts = deepName.split('.');
	parts[0] = (typeof globals === 'function' ? globals(parts[0]) : globals[parts[0]]) || parts[0];
	const last = parts.pop()!;

	let propertyPath = root;
	let deepAssignment =
		parts
			.map(part => {
				propertyPath += getPropertyAccess(part);
				return `${propertyPath}${_}=${_}${propertyPath}${_}||${_}{}`;
			})
			.concat(`${propertyPath}${getPropertyAccess(last)}`)
			.join(`,${_}`) + `${_}=${_}${assignment}`;
	if (parts.length > 0) {
		deepAssignment = `(${deepAssignment})`;
	}
	return deepAssignment;
}
