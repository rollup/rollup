import { INTEROP_DEFAULT_VARIABLE, INTEROP_NAMESPACE_VARIABLE } from './variableNames';

export const defaultInteropHelpersByInteropType: { [interopType: string]: string | null } = {
	auto: INTEROP_DEFAULT_VARIABLE,
	default: null,
	esModule: null,
	false: null,
	true: INTEROP_DEFAULT_VARIABLE
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

export function getInteropDefault(_: string, n: string, compact: boolean) {
	const ex = compact ? 'e' : 'ex';
	const s = compact ? '' : ';';
	return (
		`function ${INTEROP_DEFAULT_VARIABLE}${_}(${ex})${_}{${_}return${_}` +
		`(${ex}${_}&&${_}(typeof ${ex}${_}===${_}'object')${_}&&${_}'default'${_}in ${ex})${_}` +
		`?${_}${ex}${_}:${_}{${_}'default':${_}${ex}${_}}${s}${_}}${n}${n}`
	);
}

export function getInteropNamespace(
	_: string,
	n: string,
	t: string,
	liveBindings: boolean,
	freeze: boolean
) {
	return (
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
	);
}

function copyPropertyLiveBinding(_: string, n: string, t: string, i: string) {
	return (
		`${i}var d${_}=${_}Object.getOwnPropertyDescriptor(e,${_}k);${n}` +
		`${i}Object.defineProperty(n,${_}k,${_}d.get${_}?${_}d${_}:${_}{${n}` +
		`${i}${t}enumerable:${_}true,${n}` +
		`${i}${t}get:${_}function${_}()${_}{${n}` +
		`${i}${t}${t}return e[k];${n}` +
		`${i}${t}}${n}` +
		`${i}});${n}`
	);
}

function copyPropertyStatic(_: string, n: string, _t: string, i: string) {
	return `${i}n[k]${_}=e${_}[k];${n}`;
}
