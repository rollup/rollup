import { INTEROP_DEFAULT_VARIABLE } from './variableNames';

export interface NameCollection {
	[name: string]: true;
}

// Verified on IE 6/7 that these keywords can't be used for object properties without escaping:
//   break case catch class const continue debugger default delete do
//   else enum export extends false finally for function if import
//   in instanceof new null return super switch this throw true
//   try typeof var void while with
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
	false: true,
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
	this: true,
	throw: true,
	true: true,
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
