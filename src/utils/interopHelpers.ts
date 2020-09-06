const INTEROP_DEFAULT_VARIABLE = '_interopDefault';
const INTEROP_DEFAULT_LEGACY_VARIABLE = '_interopDefaultLegacy';
const INTEROP_NAMESPACE_VARIABLE = '_interopNamespace';
const INTEROP_NAMESPACE_DEFAULT_VARIABLE = '_interopNamespaceDefault';
const INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE = '_interopNamespaceDefaultOnly';

export const defaultInteropHelpersByInteropType: { [interopType: string]: string | null } = {
	auto: INTEROP_DEFAULT_VARIABLE,
	default: null,
	defaultOnly: null,
	esModule: null,
	false: null,
	true: INTEROP_DEFAULT_LEGACY_VARIABLE
};

export function isDefaultAProperty(interopType: string, externalLiveBindings: boolean) {
	return (
		interopType === 'esModule' ||
		(externalLiveBindings && (interopType === 'auto' || interopType === 'true'))
	);
}

export const namespaceInteropHelpersByInteropType: { [interopType: string]: string | null } = {
	auto: INTEROP_NAMESPACE_VARIABLE,
	default: INTEROP_NAMESPACE_DEFAULT_VARIABLE,
	defaultOnly: INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE,
	esModule: null,
	false: null,
	true: INTEROP_NAMESPACE_VARIABLE
};

export function canDefaultBeTakenFromNamespace(interopType: string, externalLiveBindings: boolean) {
	return (
		isDefaultAProperty(interopType, externalLiveBindings) &&
		defaultInteropHelpersByInteropType[interopType] === INTEROP_DEFAULT_VARIABLE
	);
}

export function getDefaultOnlyHelper(): string {
	return INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE;
}

export function getHelpersBlock(
	usedHelpers: Set<string>,
	accessedGlobals: Set<string>,
	_: string,
	n: string,
	s: string,
	t: string,
	liveBindings: boolean,
	freeze: boolean,
	esModule: boolean
): string {
	return HELPER_NAMES.map(variable =>
		usedHelpers.has(variable) || accessedGlobals.has(variable)
			? HELPER_GENERATORS[variable](_, n, s, t, liveBindings, freeze, esModule, usedHelpers)
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
		freeze: boolean,
		esModule: boolean,
		usedHelpers: Set<string>
	) => string;
} = {
	[INTEROP_DEFAULT_VARIABLE]: (_, n, s, _t, liveBindings) =>
		`function ${INTEROP_DEFAULT_VARIABLE}${_}(e)${_}{${_}return ` +
		`e${_}&&${_}e.__esModule${_}?${_}` +
		`${liveBindings ? getDefaultLiveBinding(_) : getDefaultStatic(_)}${s}${_}}${n}${n}`,
	[INTEROP_DEFAULT_LEGACY_VARIABLE]: (_, n, s, _t, liveBindings) =>
		`function ${INTEROP_DEFAULT_LEGACY_VARIABLE}${_}(e)${_}{${_}return ` +
		`e${_}&&${_}typeof e${_}===${_}'object'${_}&&${_}'default'${_}in e${_}?${_}` +
		`${liveBindings ? getDefaultLiveBinding(_) : getDefaultStatic(_)}${s}${_}}${n}${n}`,
	[INTEROP_NAMESPACE_VARIABLE]: (_, n, s, t, liveBindings, freeze, esModule, usedHelpers) =>
		`function ${INTEROP_NAMESPACE_VARIABLE}(e)${_}{${n}` +
		(usedHelpers.has(INTEROP_NAMESPACE_DEFAULT_VARIABLE)
			? `${t}return e${_}&&${_}e.__esModule${_}?${_}e${_}:${_}${INTEROP_NAMESPACE_DEFAULT_VARIABLE}(e)${s}${n}`
			: `${t}if${_}(e${_}&&${_}e.__esModule)${_}{${_}return e${s}${_}}${_}else${_}{${n}` +
			  createNamespaceObject(_, n, t, t + t, liveBindings, freeze, esModule) +
			  `${t}}${n}`) +
		`}${n}${n}`,
	[INTEROP_NAMESPACE_DEFAULT_VARIABLE]: (_, n, _s, t, liveBindings, freeze, esModule) =>
		`function ${INTEROP_NAMESPACE_DEFAULT_VARIABLE}(e)${_}{${n}` +
		createNamespaceObject(_, n, t, t, liveBindings, freeze, esModule) +
		`}${n}${n}`,
	[INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE]: (_, n, _s, t, _liveBindings, freeze, esModule) =>
		`function ${INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE}(e)${_}{${n}` +
		`${t}return ${getFrozen(
			addEsModule(`{__proto__: null,${_}'default':${_}e}`, _, esModule),
			freeze
		)};${n}` +
		`}${n}${n}`
};

function getDefaultLiveBinding(_: string) {
	return `e${_}:${_}{${_}'default':${_}e${_}}`;
}

function getDefaultStatic(_: string) {
	return `e['default']${_}:${_}e`;
}

function createNamespaceObject(
	_: string,
	n: string,
	t: string,
	i: string,
	liveBindings: boolean,
	freeze: boolean,
	esModule: boolean
) {
	return (
		`${i}var n${_}=${_}${addEsModule('Object.create(null)', _, esModule)};${n}` +
		`${i}if${_}(e)${_}{${n}` +
		`${i}${t}Object.keys(e).forEach(function${_}(k)${_}{${n}` +
		copyProperty(_, n, t, i + t + t, liveBindings) +
		`${i}${t}});${n}` +
		`${i}}${n}` +
		`${i}n['default']${_}=${_}e;${n}` +
		`${i}return ${getFrozen('n', freeze)};${n}`
	);
}

function copyProperty(_: string, n: string, t: string, i: string, liveBindings: boolean) {
	return liveBindings
		? `${i}if${_}(k${_}!==${_}'default')${_}{${n}` +
				`${i}${t}var d${_}=${_}Object.getOwnPropertyDescriptor(e,${_}k);${n}` +
				`${i}${t}Object.defineProperty(n,${_}k,${_}d.get${_}?${_}d${_}:${_}{${n}` +
				`${i}${t}${t}enumerable:${_}true,${n}` +
				`${i}${t}${t}get:${_}function${_}()${_}{${n}` +
				`${i}${t}${t}${t}return e[k];${n}` +
				`${i}${t}${t}}${n}` +
				`${i}${t}});${n}` +
				`${i}}${n}`
		: `${i}n[k]${_}=${_}e[k];${n}`;
}

function getFrozen(fragment: string, freeze: boolean): string {
	return freeze ? `Object.freeze(${fragment})` : fragment;
}

function addEsModule(fragment: string, _: string, esModule: boolean): string {
	return esModule
		? `Object.defineProperty(${fragment},${_}'__esModule',${_}{${_}value:${_}true${_}})`
		: fragment;
}

export const HELPER_NAMES = Object.keys(HELPER_GENERATORS);
