import { INTEROP_NAMESPACE_VARIABLE } from '../../utils/variableNames';

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

export function getInteropNamespace(_: string, n: string, t: string, liveBindings: boolean) {
	return (
		`function ${INTEROP_NAMESPACE_VARIABLE}(e)${_}{${n}` +
		`${t}if${_}(e${_}&&${_}e.__esModule)${_}{${_}return e;${_}}${_}else${_}{${n}` +
		`${t}${t}var n${_}=${_}{};${n}` +
		`${t}${t}if${_}(e)${_}{${n}` +
		`${t}${t}${t}Object.keys(e).forEach(function${_}(k)${_}{${n}` +
		(liveBindings ? copyPropertyLiveBinding : copyPropertyStatic)(_, n, t, t + t + t + t) +
		`${t}${t}${t}});${n}` +
		`${t}${t}}${n}` +
		`${t}${t}n['default']${_}=${_}e;${n}` +
		`${t}${t}return n;${n}` +
		`${t}}${n}` +
		`}${n}${n}`
	);
}
