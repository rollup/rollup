import { INTEROP_DEFAULT_VARIABLE } from './variableNames';

export interface NameCollection {
	[name: string]: true;
}

export const RESERVED_NAMES: NameCollection = Object.assign(Object.create(null), {
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

const NONE: NameCollection = {};
const EXPORTS: NameCollection = { exports: true };

export const RESERVED_NAMES_BY_FORMAT: {
	[format: string]: { forbiddenNames: NameCollection; formatGlobals: NameCollection };
} = {
	amd: { formatGlobals: EXPORTS, forbiddenNames: RESERVED_NAMES },
	cjs: {
		forbiddenNames: RESERVED_NAMES,
		formatGlobals: { exports: true, module: true, [INTEROP_DEFAULT_VARIABLE]: true }
	},
	es: { formatGlobals: NONE, forbiddenNames: RESERVED_NAMES },
	iife: { formatGlobals: EXPORTS, forbiddenNames: RESERVED_NAMES },
	system: {
		forbiddenNames: Object.assign(Object.create(null), RESERVED_NAMES, EXPORTS),
		formatGlobals: NONE
	},
	umd: { formatGlobals: EXPORTS, forbiddenNames: RESERVED_NAMES }
};
