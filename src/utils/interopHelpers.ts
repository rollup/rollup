import type { InteropType } from '../rollup/types';
import type { GenerateCodeSnippets } from './generateCodeSnippets';

const INTEROP_DEFAULT_VARIABLE = '_interopDefault';
const INTEROP_DEFAULT_COMPAT_VARIABLE = '_interopDefaultCompat';
const INTEROP_NAMESPACE_VARIABLE = '_interopNamespace';
const INTEROP_NAMESPACE_COMPAT_VARIABLE = '_interopNamespaceCompat';
const INTEROP_NAMESPACE_DEFAULT_VARIABLE = '_interopNamespaceDefault';
export const INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE = '_interopNamespaceDefaultOnly';
export const MERGE_NAMESPACES_VARIABLE = '_mergeNamespaces';
export const DOCUMENT_CURRENT_SCRIPT = '_documentCurrentScript';

export const defaultInteropHelpersByInteropType: { [T in InteropType]: string | null } = {
	auto: INTEROP_DEFAULT_VARIABLE,
	compat: INTEROP_DEFAULT_COMPAT_VARIABLE,
	default: null,
	defaultOnly: null,
	esModule: null
};

export const isDefaultAProperty = (
	interopType: InteropType,
	externalLiveBindings: boolean
): boolean =>
	interopType === 'esModule' ||
	(externalLiveBindings && (interopType === 'auto' || interopType === 'compat'));

export const namespaceInteropHelpersByInteropType: { [T in InteropType]: string | null } = {
	auto: INTEROP_NAMESPACE_VARIABLE,
	compat: INTEROP_NAMESPACE_COMPAT_VARIABLE,
	default: INTEROP_NAMESPACE_DEFAULT_VARIABLE,
	defaultOnly: INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE,
	esModule: null
};

export const canDefaultBeTakenFromNamespace = (
	interopType: InteropType,
	externalLiveBindings: boolean
): boolean => interopType !== 'esModule' && isDefaultAProperty(interopType, externalLiveBindings);

export const getHelpersBlock = (
	additionalHelpers: ReadonlySet<string> | null,
	accessedGlobals: ReadonlySet<string>,
	indent: string,
	snippets: GenerateCodeSnippets,
	liveBindings: boolean,
	freeze: boolean,
	symbols: boolean
): string => {
	const usedHelpers = new Set(additionalHelpers);
	for (const variable of HELPER_NAMES) {
		if (accessedGlobals.has(variable)) {
			usedHelpers.add(variable);
		}
	}
	return HELPER_NAMES.map(variable =>
		usedHelpers.has(variable)
			? HELPER_GENERATORS[variable](indent, snippets, liveBindings, freeze, symbols, usedHelpers)
			: ''
	).join('');
};

const HELPER_GENERATORS: {
	[variable: string]: (
		indent: string,
		snippets: GenerateCodeSnippets,
		liveBindings: boolean,
		freeze: boolean,
		symbols: boolean,
		usedHelpers: ReadonlySet<string>
	) => string;
} = {
	[DOCUMENT_CURRENT_SCRIPT](_t, { _, n }) {
		return `var${_}${DOCUMENT_CURRENT_SCRIPT}${_}=${_}typeof${_}document${_}!==${_}'undefined'${_}?${_}document.currentScript${_}:${_}null;${n}`;
	},
	[INTEROP_DEFAULT_COMPAT_VARIABLE](_t, snippets, liveBindings) {
		const { _, getDirectReturnFunction, n } = snippets;
		const [left, right] = getDirectReturnFunction(['e'], {
			functionReturn: true,
			lineBreakIndent: null,
			name: INTEROP_DEFAULT_COMPAT_VARIABLE
		});
		return (
			`${left}${getIsCompatNamespace(snippets)}${_}?${_}` +
			`${
				liveBindings ? getDefaultLiveBinding(snippets) : getDefaultStatic(snippets)
			}${right}${n}${n}`
		);
	},
	[INTEROP_DEFAULT_VARIABLE](_t, snippets, liveBindings) {
		const { _, getDirectReturnFunction, n } = snippets;
		const [left, right] = getDirectReturnFunction(['e'], {
			functionReturn: true,
			lineBreakIndent: null,
			name: INTEROP_DEFAULT_VARIABLE
		});
		return (
			`${left}e${_}&&${_}e.__esModule${_}?${_}` +
			`${
				liveBindings ? getDefaultLiveBinding(snippets) : getDefaultStatic(snippets)
			}${right}${n}${n}`
		);
	},
	[INTEROP_NAMESPACE_COMPAT_VARIABLE](t, snippets, liveBindings, freeze, symbols, usedHelpers) {
		const { _, getDirectReturnFunction, n } = snippets;
		if (usedHelpers.has(INTEROP_NAMESPACE_DEFAULT_VARIABLE)) {
			const [left, right] = getDirectReturnFunction(['e'], {
				functionReturn: true,
				lineBreakIndent: null,
				name: INTEROP_NAMESPACE_COMPAT_VARIABLE
			});
			return `${left}${getIsCompatNamespace(
				snippets
			)}${_}?${_}e${_}:${_}${INTEROP_NAMESPACE_DEFAULT_VARIABLE}(e)${right}${n}${n}`;
		}
		return (
			`function ${INTEROP_NAMESPACE_COMPAT_VARIABLE}(e)${_}{${n}` +
			`${t}if${_}(${getIsCompatNamespace(snippets)})${_}return e;${n}` +
			createNamespaceObject(t, t, snippets, liveBindings, freeze, symbols) +
			`}${n}${n}`
		);
	},
	[INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE](
		_t,
		snippets,
		_liveBindings: boolean,
		freeze: boolean,
		symbols: boolean
	) {
		const { getDirectReturnFunction, getObject, n } = snippets;
		const [left, right] = getDirectReturnFunction(['e'], {
			functionReturn: true,
			lineBreakIndent: null,
			name: INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE
		});
		return `${left}${getFrozen(
			freeze,
			getWithToStringTag(
				symbols,
				getObject(
					[
						['__proto__', 'null'],
						['default', 'e']
					],
					{ lineBreakIndent: null }
				),
				snippets
			)
		)}${right}${n}${n}`;
	},
	[INTEROP_NAMESPACE_DEFAULT_VARIABLE](t, snippets, liveBindings, freeze, symbols) {
		const { _, n } = snippets;
		return (
			`function ${INTEROP_NAMESPACE_DEFAULT_VARIABLE}(e)${_}{${n}` +
			createNamespaceObject(t, t, snippets, liveBindings, freeze, symbols) +
			`}${n}${n}`
		);
	},
	[INTEROP_NAMESPACE_VARIABLE](t, snippets, liveBindings, freeze, symbols, usedHelpers) {
		const { _, getDirectReturnFunction, n } = snippets;
		if (usedHelpers.has(INTEROP_NAMESPACE_DEFAULT_VARIABLE)) {
			const [left, right] = getDirectReturnFunction(['e'], {
				functionReturn: true,
				lineBreakIndent: null,
				name: INTEROP_NAMESPACE_VARIABLE
			});
			return `${left}e${_}&&${_}e.__esModule${_}?${_}e${_}:${_}${INTEROP_NAMESPACE_DEFAULT_VARIABLE}(e)${right}${n}${n}`;
		}
		return (
			`function ${INTEROP_NAMESPACE_VARIABLE}(e)${_}{${n}` +
			`${t}if${_}(e${_}&&${_}e.__esModule)${_}return e;${n}` +
			createNamespaceObject(t, t, snippets, liveBindings, freeze, symbols) +
			`}${n}${n}`
		);
	},
	[MERGE_NAMESPACES_VARIABLE](t, snippets, liveBindings, freeze, symbols) {
		const { _, cnst, n } = snippets;
		const useForEach = cnst === 'var' && liveBindings;
		return (
			`function ${MERGE_NAMESPACES_VARIABLE}(n, m)${_}{${n}` +
			`${t}${loopOverNamespaces(
				`{${n}` +
					`${t}${t}${t}if${_}(k${_}!==${_}'default'${_}&&${_}!(k in n))${_}{${n}` +
					(liveBindings
						? useForEach
							? copyOwnPropertyLiveBinding
							: copyPropertyLiveBinding
						: copyPropertyStatic)(t, t + t + t + t, snippets) +
					`${t}${t}${t}}${n}` +
					`${t}${t}}`,
				useForEach,
				t,
				snippets
			)}${n}` +
			`${t}return ${getFrozen(freeze, getWithToStringTag(symbols, 'n', snippets))};${n}` +
			`}${n}${n}`
		);
	}
};

const getDefaultLiveBinding = ({ _, getObject }: GenerateCodeSnippets) =>
	`e${_}:${_}${getObject([['default', 'e']], { lineBreakIndent: null })}`;

const getDefaultStatic = ({ _, getPropertyAccess }: GenerateCodeSnippets) =>
	`e${getPropertyAccess('default')}${_}:${_}e`;

const getIsCompatNamespace = ({ _ }: GenerateCodeSnippets) =>
	`e${_}&&${_}typeof e${_}===${_}'object'${_}&&${_}'default'${_}in e`;

const createNamespaceObject = (
	t: string,
	index: string,
	snippets: GenerateCodeSnippets,
	liveBindings: boolean,
	freeze: boolean,
	symbols: boolean
) => {
	const { _, cnst, getObject, getPropertyAccess, n, s } = snippets;
	const copyProperty =
		`{${n}` +
		(liveBindings ? copyNonDefaultOwnPropertyLiveBinding : copyPropertyStatic)(
			t,
			index + t + t,
			snippets
		) +
		`${index}${t}}`;
	return (
		`${index}${cnst} n${_}=${_}Object.create(null${
			symbols ? `,${_}{${_}[Symbol.toStringTag]:${_}${getToStringTagValue(getObject)}${_}}` : ''
		});${n}` +
		`${index}if${_}(e)${_}{${n}` +
		`${index}${t}${loopOverKeys(copyProperty, !liveBindings, snippets)}${n}` +
		`${index}}${n}` +
		`${index}n${getPropertyAccess('default')}${_}=${_}e;${n}` +
		`${index}return ${getFrozen(freeze, 'n')}${s}${n}`
	);
};

const loopOverKeys = (
	body: string,
	allowVariableLoopVariable: boolean,
	{ _, cnst, getFunctionIntro, s }: GenerateCodeSnippets
) =>
	cnst !== 'var' || allowVariableLoopVariable
		? `for${_}(${cnst} k in e)${_}${body}`
		: `Object.keys(e).forEach(${getFunctionIntro(['k'], {
				isAsync: false,
				name: null
			})}${body})${s}`;

const loopOverNamespaces = (
	body: string,
	useForEach: boolean,
	t: string,
	{ _, cnst, getDirectReturnFunction, getFunctionIntro, n }: GenerateCodeSnippets
) => {
	if (useForEach) {
		const [left, right] = getDirectReturnFunction(['e'], {
			functionReturn: false,
			lineBreakIndent: { base: t, t },
			name: null
		});
		return (
			`m.forEach(${left}` +
			`e${_}&&${_}typeof e${_}!==${_}'string'${_}&&${_}!Array.isArray(e)${_}&&${_}Object.keys(e).forEach(${getFunctionIntro(
				['k'],
				{
					isAsync: false,
					name: null
				}
			)}${body})${right});`
		);
	}
	return (
		`for${_}(var i${_}=${_}0;${_}i${_}<${_}m.length;${_}i++)${_}{${n}` +
		`${t}${t}${cnst} e${_}=${_}m[i];${n}` +
		`${t}${t}if${_}(typeof e${_}!==${_}'string'${_}&&${_}!Array.isArray(e))${_}{${_}for${_}(${cnst} k in e)${_}${body}${_}}${n}${t}}`
	);
};

const copyNonDefaultOwnPropertyLiveBinding = (
	t: string,
	index: string,
	snippets: GenerateCodeSnippets
) => {
	const { _, n } = snippets;
	return (
		`${index}if${_}(k${_}!==${_}'default')${_}{${n}` +
		copyOwnPropertyLiveBinding(t, index + t, snippets) +
		`${index}}${n}`
	);
};

const copyOwnPropertyLiveBinding = (
	t: string,
	index: string,
	{ _, cnst, getDirectReturnFunction, n }: GenerateCodeSnippets
) => {
	const [left, right] = getDirectReturnFunction([], {
		functionReturn: true,
		lineBreakIndent: null,
		name: null
	});
	return (
		`${index}${cnst} d${_}=${_}Object.getOwnPropertyDescriptor(e,${_}k);${n}` +
		`${index}Object.defineProperty(n,${_}k,${_}d.get${_}?${_}d${_}:${_}{${n}` +
		`${index}${t}enumerable:${_}true,${n}` +
		`${index}${t}get:${_}${left}e[k]${right}${n}` +
		`${index}});${n}`
	);
};

const copyPropertyLiveBinding = (
	t: string,
	index: string,
	{ _, cnst, getDirectReturnFunction, n }: GenerateCodeSnippets
) => {
	const [left, right] = getDirectReturnFunction([], {
		functionReturn: true,
		lineBreakIndent: null,
		name: null
	});
	return (
		`${index}${cnst} d${_}=${_}Object.getOwnPropertyDescriptor(e,${_}k);${n}` +
		`${index}if${_}(d)${_}{${n}` +
		`${index}${t}Object.defineProperty(n,${_}k,${_}d.get${_}?${_}d${_}:${_}{${n}` +
		`${index}${t}${t}enumerable:${_}true,${n}` +
		`${index}${t}${t}get:${_}${left}e[k]${right}${n}` +
		`${index}${t}});${n}` +
		`${index}}${n}`
	);
};

const copyPropertyStatic = (_t: string, index: string, { _, n }: GenerateCodeSnippets) =>
	`${index}n[k]${_}=${_}e[k];${n}`;

const getFrozen = (freeze: boolean, fragment: string) =>
	freeze ? `Object.freeze(${fragment})` : fragment;

const getWithToStringTag = (
	symbols: boolean,
	fragment: string,
	{ _, getObject }: GenerateCodeSnippets
) =>
	symbols
		? `Object.defineProperty(${fragment},${_}Symbol.toStringTag,${_}${getToStringTagValue(
				getObject
			)})`
		: fragment;

export const HELPER_NAMES = Object.keys(HELPER_GENERATORS);

export function getToStringTagValue(getObject: GenerateCodeSnippets['getObject']) {
	return getObject([['value', "'Module'"]], {
		lineBreakIndent: null
	});
}
