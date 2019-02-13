import { toBase64 } from './base64';
import { INTEROP_DEFAULT_VARIABLE } from './variableNames';

export interface NameCollection {
	[name: string]: true;
}

const RESERVED_NAMES: NameCollection = Object.assign(Object.create(null), {
	await: true,
	break: true,
	case: true,
	catch: true,
	class: true,
	const: true,
	continue: true,
	debugger: true,
	default: true,
	delete: true,
	do: true,
	else: true,
	enum: true,
	eval: true,
	export: true,
	extends: true,
	finally: true,
	for: true,
	function: true,
	if: true,
	implements: true,
	import: true,
	in: true,
	instanceof: true,
	interface: true,
	let: true,
	new: true,
	null: true,
	package: true,
	private: true,
	protected: true,
	public: true,
	return: true,
	static: true,
	super: true,
	switch: true,
	throw: true,
	try: true,
	typeof: true,
	undefined: true,
	var: true,
	void: true,
	while: true,
	with: true,
	yield: true
});

const NONE = Object.create(null);
const EXPORTS: NameCollection = { exports: true };

export const ADDITIONAL_NAMES_BY_FORMAT: {
	[format: string]: { globals: NameCollection; forbidden: NameCollection };
} = {
	cjs: {
		globals: { exports: true, module: true, [INTEROP_DEFAULT_VARIABLE]: true },
		forbidden: RESERVED_NAMES
	},
	iife: { globals: EXPORTS, forbidden: RESERVED_NAMES },
	amd: { globals: EXPORTS, forbidden: RESERVED_NAMES },
	umd: { globals: EXPORTS, forbidden: RESERVED_NAMES },
	system: { globals: NONE, forbidden: Object.assign(Object.create(null), RESERVED_NAMES, EXPORTS) },
	es: { globals: NONE, forbidden: RESERVED_NAMES }
};

export function getSafeName(baseName: string, usedNames: NameCollection): string {
	let safeName = baseName;
	let count = 1;
	while (usedNames[safeName]) {
		safeName = `${baseName}$${toBase64(count++)}`;
	}
	usedNames[safeName] = true;
	return safeName;
}
