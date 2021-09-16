import { GenerateCodeSnippets } from './generateCodeSnippets';

const INTEROP_DEFAULT_VARIABLE = '_interopDefault';
const INTEROP_DEFAULT_LEGACY_VARIABLE = '_interopDefaultLegacy';
const INTEROP_NAMESPACE_VARIABLE = '_interopNamespace';
const INTEROP_NAMESPACE_DEFAULT_VARIABLE = '_interopNamespaceDefault';
export const INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE = '_interopNamespaceDefaultOnly';
export const MERGE_NAMESPACES_VARIABLE = '_mergeNamespaces';

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

export const getHelpersBlock = (
	additionalHelpers: Set<string> | null,
	accessedGlobals: Set<string>,
	indent: string,
	snippets: GenerateCodeSnippets,
	liveBindings: boolean,
	freeze: boolean,
	namespaceToStringTag: boolean
): string => {
	const usedHelpers = new Set(additionalHelpers);
	for (const variable of HELPER_NAMES) {
		if (accessedGlobals.has(variable)) {
			usedHelpers.add(variable);
		}
	}
	return HELPER_NAMES.map(variable =>
		usedHelpers.has(variable)
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
};

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
	[INTEROP_DEFAULT_LEGACY_VARIABLE](_t, snippets, liveBindings) {
		const { _, getDirectReturnFunctionLeft, n, namedDirectReturnFunctionRight } = snippets;
		return (
			`${getDirectReturnFunctionLeft(['e'], {
				functionReturn: true,
				name: INTEROP_DEFAULT_LEGACY_VARIABLE
			})}e${_}&&${_}typeof e${_}===${_}'object'${_}&&${_}'default'${_}in e${_}?${_}` +
			`${
				liveBindings ? getDefaultLiveBinding(snippets) : getDefaultStatic(snippets)
			}${namedDirectReturnFunctionRight}${n}${n}`
		);
	},
	[INTEROP_DEFAULT_VARIABLE](_t, snippets, liveBindings) {
		const { _, getDirectReturnFunctionLeft, n, namedDirectReturnFunctionRight } = snippets;
		return (
			`${getDirectReturnFunctionLeft(['e'], {
				functionReturn: true,
				name: INTEROP_DEFAULT_VARIABLE
			})}e${_}&&${_}e.__esModule${_}?${_}` +
			`${
				liveBindings ? getDefaultLiveBinding(snippets) : getDefaultStatic(snippets)
			}${namedDirectReturnFunctionRight}${n}${n}`
		);
	},
	[INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE](
		_t,
		{ _, getDirectReturnFunctionLeft, getObject, n, namedDirectReturnFunctionRight },
		_liveBindings: boolean,
		freeze: boolean,
		namespaceToStringTag: boolean
	) {
		return `${getDirectReturnFunctionLeft(['e'], {
			functionReturn: true,
			name: INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE
		})}${getFrozen(
			getObject(
				[
					['__proto__', 'null'],
					...(namespaceToStringTag
						? [[null, `[Symbol.toStringTag]:${_}'Module'`] as [null, string]]
						: []),
					['default', 'e']
				],
				{ indent: _, lineBreaks: false }
			),
			freeze
		)}${namedDirectReturnFunctionRight}${n}${n}`;
	},
	[INTEROP_NAMESPACE_DEFAULT_VARIABLE](t, snippets, liveBindings, freeze, namespaceToStringTag) {
		const { _, n } = snippets;
		return (
			`function ${INTEROP_NAMESPACE_DEFAULT_VARIABLE}(e)${_}{${n}` +
			createNamespaceObject(t, t, snippets, liveBindings, freeze, namespaceToStringTag) +
			`}${n}${n}`
		);
	},
	[INTEROP_NAMESPACE_VARIABLE](
		t,
		snippets,
		liveBindings,
		freeze,
		namespaceToStringTag,
		usedHelpers
	) {
		const { _, getDirectReturnFunctionLeft, n, namedDirectReturnFunctionRight } = snippets;
		return usedHelpers.has(INTEROP_NAMESPACE_DEFAULT_VARIABLE)
			? `${getDirectReturnFunctionLeft(['e'], {
					functionReturn: true,
					name: INTEROP_NAMESPACE_VARIABLE
			  })}e${_}&&${_}e.__esModule${_}?${_}e${_}:${_}${INTEROP_NAMESPACE_DEFAULT_VARIABLE}(e)${namedDirectReturnFunctionRight}${n}${n}`
			: `function ${INTEROP_NAMESPACE_VARIABLE}(e)${_}{${n}` +
					`${t}if${_}(e${_}&&${_}e.__esModule)${_}return e;${n}` +
					createNamespaceObject(t, t, snippets, liveBindings, freeze, namespaceToStringTag) +
					`}${n}${n}`;
	},
	[MERGE_NAMESPACES_VARIABLE](t, snippets, liveBindings, freeze) {
		const { _, directReturnFunctionRight, getDirectReturnFunctionLeft, getFunctionIntro, n } =
			snippets;
		// TODO Lukas use more efficient loops if we can use const
		return (
			`function ${MERGE_NAMESPACES_VARIABLE}(n, m)${_}{${n}` +
			`${t}m.forEach(${getDirectReturnFunctionLeft(['e'], {
				functionReturn: false,
				name: null
			})}Object.keys(e).forEach(${getFunctionIntro(['k'], {
				isAsync: false,
				name: null
			})}{${n}` +
			`${t}${t}if${_}(k${_}!==${_}'default'${_}&&${_}!(k in n))${_}{${n}` +
			(liveBindings ? copyPropertyLiveBinding : copyPropertyStatic)(t, t + t + t, snippets) +
			`${t}${t}}${n}` +
			`${t}})${directReturnFunctionRight});${n}` +
			`${t}return ${getFrozen('n', freeze)};${n}` +
			`}${n}${n}`
		);
	}
};

const getDefaultLiveBinding = ({ _, getObject }: GenerateCodeSnippets) =>
	`e${_}:${_}${getObject([['default', 'e']], { indent: _, lineBreaks: false })}`;

const getDefaultStatic = ({ _, getPropertyAccess }: GenerateCodeSnippets) =>
	`e${getPropertyAccess('default')}${_}:${_}e`;

const createNamespaceObject = (
	t: string,
	i: string,
	snippets: GenerateCodeSnippets,
	liveBindings: boolean,
	freeze: boolean,
	namespaceToStringTag: boolean
) => {
	const { _, cnst, getPropertyAccess, n, s } = snippets;
	const copyProperty =
		`{${n}` +
		(liveBindings ? copyNonDefaultPropertyLiveBinding : copyPropertyStatic)(
			t,
			i + t + t,
			snippets
		) +
		`${i}${t}}`;
	return (
		`${i}${cnst} n${_}=${_}${
			namespaceToStringTag
				? `{__proto__:${_}null,${_}[Symbol.toStringTag]:${_}'Module'}`
				: 'Object.create(null)'
		};${n}` +
		`${i}if${_}(e)${_}{${n}` +
		`${i}${t}${loopOverKeys(copyProperty, !liveBindings, snippets)}${n}` +
		`${i}}${n}` +
		`${i}n${getPropertyAccess('default')}${_}=${_}e;${n}` +
		`${i}return ${getFrozen('n', freeze)}${s}${n}`
	);
};

const loopOverKeys = (
	body: string,
	allowVarLoopVariable: boolean,
	{ _, cnst, getFunctionIntro, s }: GenerateCodeSnippets
) =>
	cnst !== 'var' || allowVarLoopVariable
		? `for${_}(${cnst} k in e)${_}${body}`
		: `Object.keys(e).forEach(${getFunctionIntro(['k'], {
				isAsync: false,
				name: null
		  })}${body})${s}`;

const copyNonDefaultPropertyLiveBinding = (
	t: string,
	i: string,
	snippets: GenerateCodeSnippets
) => {
	const { _, n } = snippets;
	return (
		`${i}if${_}(k${_}!==${_}'default')${_}{${n}` +
		copyPropertyLiveBinding(t, i + t, snippets) +
		`${i}}${n}`
	);
};

const copyPropertyLiveBinding = (
	t: string,
	i: string,
	{ _, cnst, directReturnFunctionRight, getDirectReturnFunctionLeft, n }: GenerateCodeSnippets
) =>
	`${i}${cnst} d${_}=${_}Object.getOwnPropertyDescriptor(e,${_}k);${n}` +
	`${i}Object.defineProperty(n,${_}k,${_}d.get${_}?${_}d${_}:${_}{${n}` +
	`${i}${t}enumerable:${_}true,${n}` +
	`${i}${t}get:${_}${getDirectReturnFunctionLeft([], {
		functionReturn: true,
		name: null
	})}e[k]${directReturnFunctionRight}${n}` +
	`${i}});${n}`;

const copyPropertyStatic = (_t: string, i: string, { _, n }: GenerateCodeSnippets) =>
	`${i}n[k]${_}=${_}e[k];${n}`;

const getFrozen = (fragment: string, freeze: boolean) =>
	freeze ? `Object.freeze(${fragment})` : fragment;

export const HELPER_NAMES = Object.keys(HELPER_GENERATORS);
