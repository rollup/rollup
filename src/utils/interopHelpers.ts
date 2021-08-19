import { GenerateCodeSnippets } from './generateCodeSnippets';

const INTEROP_DEFAULT_VARIABLE = '_interopDefault';
const INTEROP_DEFAULT_LEGACY_VARIABLE = '_interopDefaultLegacy';
const INTEROP_NAMESPACE_VARIABLE = '_interopNamespace';
const INTEROP_NAMESPACE_DEFAULT_VARIABLE = '_interopNamespaceDefault';
const INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE = '_interopNamespaceDefaultOnly';

// TODO Lukas use snippets in this file
export const defaultInteropHelpersByInteropType: { [interopType: string]: string | null } = {
	auto: INTEROP_DEFAULT_VARIABLE,
	default: null,
	defaultOnly: null,
	esModule: null,
	false: null,
	true: INTEROP_DEFAULT_LEGACY_VARIABLE
};

export const isDefaultAProperty = (interopType: string, externalLiveBindings: boolean): boolean =>
	interopType === 'esModule' ||
	(externalLiveBindings && (interopType === 'auto' || interopType === 'true'));

export const namespaceInteropHelpersByInteropType: { [interopType: string]: string | null } = {
	auto: INTEROP_NAMESPACE_VARIABLE,
	default: INTEROP_NAMESPACE_DEFAULT_VARIABLE,
	defaultOnly: INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE,
	esModule: null,
	false: null,
	true: INTEROP_NAMESPACE_VARIABLE
};

export const canDefaultBeTakenFromNamespace = (
	interopType: string,
	externalLiveBindings: boolean
): boolean =>
	isDefaultAProperty(interopType, externalLiveBindings) &&
	defaultInteropHelpersByInteropType[interopType] === INTEROP_DEFAULT_VARIABLE;

export const getDefaultOnlyHelper = (): string => INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE;

export const getHelpersBlock = (
	usedHelpers: Set<string>,
	accessedGlobals: Set<string>,
	indent: string,
	snippets: GenerateCodeSnippets,
	liveBindings: boolean,
	freeze: boolean,
	namespaceToStringTag: boolean
): string =>
	HELPER_NAMES.map(variable =>
		usedHelpers.has(variable) || accessedGlobals.has(variable)
			? HELPER_GENERATORS[variable](
					indent,
					snippets,
					liveBindings,
					freeze,
					namespaceToStringTag,
					usedHelpers
			  )
			: ''
	).join('');

// TODO Lukas why are those properly indented?
const HELPER_GENERATORS: {
	[variable: string]: (
		indent: string,
		snippets: GenerateCodeSnippets,
		liveBindings: boolean,
		freeze: boolean,
		namespaceToStringTag: boolean,
		usedHelpers: Set<string>
	) => string;
} = {
	[INTEROP_DEFAULT_LEGACY_VARIABLE]: (_t, { _, n, s }, liveBindings) =>
		`function ${INTEROP_DEFAULT_LEGACY_VARIABLE}${_}(e)${_}{${_}return ` +
		`e${_}&&${_}typeof e${_}===${_}'object'${_}&&${_}'default'${_}in e${_}?${_}` +
		`${liveBindings ? getDefaultLiveBinding(_) : getDefaultStatic(_)}${s}${_}}${n}${n}`,
	[INTEROP_DEFAULT_VARIABLE]: (_t, { _, n, s }, liveBindings) =>
		`function ${INTEROP_DEFAULT_VARIABLE}${_}(e)${_}{${_}return ` +
		`e${_}&&${_}e.__esModule${_}?${_}` +
		`${liveBindings ? getDefaultLiveBinding(_) : getDefaultStatic(_)}${s}${_}}${n}${n}`,
	[INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE]: (
		t,
		{ _, n },
		_liveBindings: boolean,
		freeze: boolean,
		namespaceToStringTag: boolean
	) =>
		`function ${INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE}(e)${_}{${n}` +
		`${t}return ${getFrozen(
			`{__proto__: null,${
				namespaceToStringTag ? `${_}[Symbol.toStringTag]:${_}'Module',` : ''
			}${_}'default':${_}e}`,
			freeze
		)};${n}` +
		`}${n}${n}`,
	[INTEROP_NAMESPACE_DEFAULT_VARIABLE]: (
		t,
		snippets,
		liveBindings,
		freeze,
		namespaceToStringTag
	) => {
		const { _, n } = snippets;
		return (
			`function ${INTEROP_NAMESPACE_DEFAULT_VARIABLE}(e)${_}{${n}` +
			createNamespaceObject(t, t, snippets, liveBindings, freeze, namespaceToStringTag) +
			`}${n}${n}`
		);
	},
	[INTEROP_NAMESPACE_VARIABLE]: (
		t,
		snippets,
		liveBindings,
		freeze,
		namespaceToStringTag,
		usedHelpers
	) => {
		const { _, n, s } = snippets;
		return (
			`function ${INTEROP_NAMESPACE_VARIABLE}(e)${_}{${n}` +
			(usedHelpers.has(INTEROP_NAMESPACE_DEFAULT_VARIABLE)
				? `${t}return e${_}&&${_}e.__esModule${_}?${_}e${_}:${_}${INTEROP_NAMESPACE_DEFAULT_VARIABLE}(e)${s}${n}`
				: `${t}if${_}(e${_}&&${_}e.__esModule)${_}return e;${n}` +
				  createNamespaceObject(t, t, snippets, liveBindings, freeze, namespaceToStringTag)) +
			`}${n}${n}`
		);
	}
};

const getDefaultLiveBinding = (_: string) => `e${_}:${_}{${_}'default':${_}e${_}}`;

const getDefaultStatic = (_: string) => `e['default']${_}:${_}e`;

const createNamespaceObject = (
	t: string,
	i: string,
	snippets: GenerateCodeSnippets,
	liveBindings: boolean,
	freeze: boolean,
	namespaceToStringTag: boolean
) => {
	const { _, n } = snippets;
	return (
		`${i}var n${_}=${_}${
			namespaceToStringTag
				? `{__proto__:${_}null,${_}[Symbol.toStringTag]:${_}'Module'}`
				: 'Object.create(null)'
		};${n}` +
		`${i}if${_}(e)${_}{${n}` +
		`${i}${t}Object.keys(e).forEach(function${_}(k)${_}{${n}` +
		(liveBindings ? copyPropertyLiveBinding : copyPropertyStatic)(t, i + t + t, snippets) +
		`${i}${t}});${n}` +
		`${i}}${n}` +
		`${i}n['default']${_}=${_}e;${n}` +
		`${i}return ${getFrozen('n', freeze)};${n}`
	);
};

const copyPropertyLiveBinding = (t: string, i: string, { _, n }: GenerateCodeSnippets) =>
	`${i}if${_}(k${_}!==${_}'default')${_}{${n}` +
	`${i}${t}var d${_}=${_}Object.getOwnPropertyDescriptor(e,${_}k);${n}` +
	`${i}${t}Object.defineProperty(n,${_}k,${_}d.get${_}?${_}d${_}:${_}{${n}` +
	`${i}${t}${t}enumerable:${_}true,${n}` +
	`${i}${t}${t}get:${_}function${_}()${_}{${n}` +
	`${i}${t}${t}${t}return e[k];${n}` +
	`${i}${t}${t}}${n}` +
	`${i}${t}});${n}` +
	`${i}}${n}`;

const copyPropertyStatic = (_t: string, i: string, { _, n }: GenerateCodeSnippets) =>
	`${i}n[k]${_}=${_}e[k];${n}`;

const getFrozen = (fragment: string, freeze: boolean) =>
	freeze ? `Object.freeze(${fragment})` : fragment;

export const HELPER_NAMES = Object.keys(HELPER_GENERATORS);
