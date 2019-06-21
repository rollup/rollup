import { INTEROP_NAMESPACE_VARIABLE } from '../../utils/variableNames';

export function getInteropNamespace(_: string, n: string, t: string) {
	return `function ${INTEROP_NAMESPACE_VARIABLE}(e)${_}{${n}` +
`${t}if${_}(e${_}&&${_}e.__esModule)${_}{${_}return e;${_}}${_}else${_}{${n}` +
`${t}${t}var n${_}=${_}{};${n}` +
`${t}${t}if${_}(e)${_}{${n}` +
`${t}${t}${t}Object.keys(e).forEach(function${_}(k)${_}{${n}` +
`${t}${t}${t}${t}var d${_}=${_}Object.getOwnPropertyDescriptor(e,${_}k);${n}` +
`${t}${t}${t}${t}Object.defineProperty(n,${_}k,${_}d.get${_}?${_}d${_}:${_}{${n}` +
`${t}${t}${t}${t}${t}enumerable:${_}true,${n}` +
`${t}${t}${t}${t}${t}get:${_}function${_}()${_}{${n}` +
`${t}${t}${t}${t}${t}${t}return e[k];${n}` +
`${t}${t}${t}${t}${t}}${n}` +
`${t}${t}${t}${t}});${n}` +
`${t}${t}${t}});${n}` +
`${t}${t}}${n}` +
`${t}${t}n['default']${_}=${_}e;${n}` +
`${t}${t}return n;${n}` +
`${t}}${n}` +
`}${n}${n}`;
}
