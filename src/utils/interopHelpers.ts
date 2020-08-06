const INTEROP_DEFAULT_VARIABLE = '_interopDefault';
const INTEROP_DEFAULT_LEGACY_VARIABLE = '_interopDefaultLegacy';
const INTEROP_NAMESPACE_VARIABLE = '_interopNamespace';

export const defaultInteropHelpersByInteropType: { [interopType: string]: string | null } = {
	auto: INTEROP_DEFAULT_VARIABLE,
	default: null,
	esModule: null,
	false: null,
	true: INTEROP_DEFAULT_LEGACY_VARIABLE
};

export const defaultIsPropertyByInteropType: { [interopType: string]: boolean } = {
	auto: true,
	default: false,
	esModule: true,
	false: false,
	true: true
};

export const namespaceInteropHelpersByInteropType: { [interopType: string]: string | null } = {
	auto: INTEROP_NAMESPACE_VARIABLE,
	default: INTEROP_NAMESPACE_VARIABLE,
	esModule: null,
	false: null,
	true: INTEROP_NAMESPACE_VARIABLE
};

export function getHelpersBlock(
	usedHelpers: Set<string>,
	accessedGlobals: Set<string>,
	_: string,
	n: string,
	s: string,
	t: string,
	liveBindings: boolean,
	freeze: boolean
): string {
	return HELPER_NAMES.map(variable =>
		usedHelpers.has(variable) || accessedGlobals.has(variable)
			? HELPER_GENERATORS[variable](_, n, s, t, liveBindings, freeze)
			: ''
	).join('');
}

const HELPER_GENERATORS: {
	[variable: string]: (
		_: string,
		n: string,
		s: string,
		t: string,
		liveBindings: boolean,
		freeze: boolean
	) => string;
} = {
	[INTEROP_DEFAULT_VARIABLE]: (_, n, s) =>
		`function ${INTEROP_DEFAULT_VARIABLE}${_}(e)${_}{${_}return ` +
		`e${_}&&${_}e.__esModule${_}?${_}` +
		`e${_}:${_}{${_}'default':${_}e${_}}${s}${_}}${n}${n}`,
	[INTEROP_DEFAULT_LEGACY_VARIABLE]: (_, n, s) =>
		`function ${INTEROP_DEFAULT_LEGACY_VARIABLE}${_}(e)${_}{${_}return ` +
		`e${_}&&${_}typeof e${_}===${_}'object'${_}&&${_}'default'${_}in e${_}?${_}` +
		`e${_}:${_}{${_}'default':${_}e${_}}${s}${_}}${n}${n}`,
	[INTEROP_NAMESPACE_VARIABLE]: (_, n, _s, t, liveBindings, freeze) =>
		`function ${INTEROP_NAMESPACE_VARIABLE}(e)${_}{${n}` +
		`${t}if${_}(e${_}&&${_}e.__esModule)${_}{${_}return e;${_}}${_}else${_}{${n}` +
		`${t}${t}var n${_}=${_}Object.create(null);${n}` +
		`${t}${t}if${_}(e)${_}{${n}` +
		`${t}${t}${t}Object.keys(e).forEach(function${_}(k)${_}{${n}` +
		(liveBindings ? copyPropertyLiveBinding : copyPropertyStatic)(_, n, t, t + t + t + t) +
		`${t}${t}${t}});${n}` +
		`${t}${t}}${n}` +
		`${t}${t}n['default']${_}=${_}e;${n}` +
		`${t}${t}return ${freeze ? 'Object.freeze(n)' : 'n'};${n}` +
		`${t}}${n}` +
		`}${n}${n}`
};

function copyPropertyLiveBinding(_: string, n: string, t: string, i: string) {
	return (
		`${i}if${_}(k${_}!==${_}'default')${_}{${n}` +
		`${i}${t}var d${_}=${_}Object.getOwnPropertyDescriptor(e,${_}k);${n}` +
		`${i}${t}Object.defineProperty(n,${_}k,${_}d.get${_}?${_}d${_}:${_}{${n}` +
		`${i}${t}${t}enumerable:${_}true,${n}` +
		`${i}${t}${t}get:${_}function${_}()${_}{${n}` +
		`${i}${t}${t}${t}return e[k];${n}` +
		`${i}${t}${t}}${n}` +
		`${i}${t}});${n}` +
		`${i}}${n}`
	);
}

function copyPropertyStatic(_: string, n: string, _t: string, i: string) {
	return `${i}n[k]${_}=e${_}[k];${n}`;
}

export const HELPER_NAMES = Object.keys(HELPER_GENERATORS);
