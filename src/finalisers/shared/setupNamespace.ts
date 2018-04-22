import { property } from './sanitize';
import { GlobalsOption } from '../../rollup/types';

export default function setupNamespace(
	name: string,
	root: string,
	forAssignment: boolean,
	globals: GlobalsOption,
	compact: boolean
) {
	const parts = name.split('.');
	if (globals) {
		parts[0] = (typeof globals === 'function' ? globals(parts[0]) : globals[parts[0]]) || parts[0];
	}

	const _ = compact ? '' : ' ';

	const last = parts.pop();

	let acc = root;
	if (forAssignment) {
		return parts
			.map(part => ((acc += property(part)), `${acc}${_}=${_}${acc}${_}||${_}{}`))
			.concat(`${acc}${property(last)}`)
			.join(`,${_}`);
	} else {
		return (
			parts
				.map(
					part => (
						(acc += property(part)), `${acc}${_}=${_}${acc}${_}||${_}{}${compact ? '' : ';'}`
					)
				)
				.join(compact ? ',' : '\n') + (compact && parts.length ? ';' : '\n')
		);
	}
}
