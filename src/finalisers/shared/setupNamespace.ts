import { GlobalsOption } from '../../rollup/types';
import { property } from './sanitize';

export default function setupNamespace(
	name: string,
	root: string,
	globals: GlobalsOption,
	compact: boolean | undefined
): string {
	const _ = compact ? '' : ' ';
	const parts = name.split('.');
	parts[0] = (typeof globals === 'function' ? globals(parts[0]) : globals[parts[0]]) || parts[0];
	parts.pop();

	let acc = root;
	return (
		parts
			.map(
				part => ((acc += property(part)), `${acc}${_}=${_}${acc}${_}||${_}{}${compact ? '' : ';'}`)
			)
			.join(compact ? ',' : '\n') + (compact && parts.length ? ';' : '\n')
	);
}

export function assignToDeepVariable(
	deepName: string,
	root: string,
	globals: GlobalsOption,
	compact: boolean | undefined,
	assignment: string
): string {
	const _ = compact ? '' : ' ';
	const parts = deepName.split('.');
	parts[0] = (typeof globals === 'function' ? globals(parts[0]) : globals[parts[0]]) || parts[0];
	const last = parts.pop();

	let acc = root;
	let deepAssignment = parts
		.map(part => ((acc += property(part)), `${acc}${_}=${_}${acc}${_}||${_}{}`))
		.concat(`${acc}${property(last!)}`)
		.join(`,${_}`)
		.concat(`${_}=${_}${assignment}`);
	if (parts.length > 0) {
		deepAssignment = `(${deepAssignment})`;
	}
	return deepAssignment;
}
