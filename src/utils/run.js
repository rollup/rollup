import { walk } from 'estree-walker';
import modifierNodes from '../ast/modifierNodes.js';
import isReference from '../ast/isReference.js';
import flatten from '../ast/flatten';

let pureFunctions = {};

const arrayTypes = 'Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array'.split( ' ' );
const simdTypes = 'Int8x16 Int16x8 Int32x4 Float32x4 Float64x2'.split( ' ' );
const simdMethods = 'abs add and bool check div equal extractLane fromFloat32x4 fromFloat32x4Bits fromFloat64x2 fromFloat64x2Bits fromInt16x8Bits fromInt32x4 fromInt32x4Bits fromInt8x16Bits greaterThan greaterThanOrEqual lessThan lessThanOrEqual load max maxNum min minNum mul neg not notEqual or reciprocalApproximation reciprocalSqrtApproximation replaceLane select selectBits shiftLeftByScalar shiftRightArithmeticByScalar shiftRightLogicalByScalar shuffle splat sqrt store sub swizzle xor'.split( ' ' );
let allSimdMethods = [];
simdTypes.forEach( t => {
	simdMethods.forEach( m => {
		allSimdMethods.push( `SIMD.${t}.${m}` );
	});
});

[
	'Array.isArray',
	'Error', 'EvalError', 'InternalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
	'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape', 'unescape',
	'Object', 'Object.create', 'Object.getNotifier', 'Object.getOwn', 'Object.getOwnPropertyDescriptor', 'Object.getOwnPropertyNames', 'Object.getOwnPropertySymbols', 'Object.getPrototypeOf', 'Object.is', 'Object.isExtensible', 'Object.isFrozen', 'Object.isSealed', 'Object.keys',
	'Function', 'Boolean',
	'Number', 'Number.isFinite', 'Number.isInteger', 'Number.isNaN', 'Number.isSafeInteger', 'Number.parseFloat', 'Number.parseInt',
	'Symbol', 'Symbol.for', 'Symbol.keyFor',
	'Math.abs', 'Math.acos', 'Math.acosh', 'Math.asin', 'Math.asinh', 'Math.atan', 'Math.atan2', 'Math.atanh', 'Math.cbrt', 'Math.ceil', 'Math.clz32', 'Math.cos', 'Math.cosh', 'Math.exp', 'Math.expm1', 'Math.floor', 'Math.fround', 'Math.hypot', 'Math.imul', 'Math.log', 'Math.log10', 'Math.log1p', 'Math.log2', 'Math.max', 'Math.min', 'Math.pow', 'Math.random', 'Math.round', 'Math.sign', 'Math.sin', 'Math.sinh', 'Math.sqrt', 'Math.tan', 'Math.tanh', 'Math.trunc',
	'Date', 'Date.UTC', 'Date.now', 'Date.parse',
	'String', 'String.fromCharCode', 'String.fromCodePoint', 'String.raw',
	'RegExp',
	'Map', 'Set', 'WeakMap', 'WeakSet',
	'ArrayBuffer', 'ArrayBuffer.isView',
	'DataView',
	'JSON.parse', 'JSON.stringify',
	'Promise', 'Promise.all', 'Promise.race', 'Promise.reject', 'Promise.resolve',
	'Intl.Collator', 'Intl.Collator.supportedLocalesOf', 'Intl.DateTimeFormat', 'Intl.DateTimeFormat.supportedLocalesOf', 'Intl.NumberFormat', 'Intl.NumberFormat.supportedLocalesOf'

	// TODO properties of e.g. window...
].concat(
	arrayTypes,
	arrayTypes.map( t => `${t}.from` ),
	arrayTypes.map( t => `${t}.of` ),
	simdTypes.map( t => `SIMD.${t}` ),
	allSimdMethods
).forEach( name => pureFunctions[ name ] = true );
	// TODO add others to this list from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects



export default function run ( node, scope, statement, strongDependencies, force ) {
	let hasSideEffect = false;

	walk( node, {
		enter ( node, parent ) {
			if ( !force && /Function/.test( node.type ) ) return this.skip();

			if ( node._scope ) scope = node._scope;

			if ( isReference( node, parent ) ) {
				const flattened = flatten( node );

				if ( flattened.name === 'arguments' ) {
					hasSideEffect = true;
				}

				else if ( !scope.contains( flattened.name ) ) {
					const declaration = statement.module.trace( flattened.name );
					if ( declaration && !declaration.isExternal ) {
						const module = declaration.module || declaration.statement.module; // TODO is this right?
						if ( !module.isExternal && !~strongDependencies.indexOf( module ) ) strongDependencies.push( module );
					}
				}
			}

			else if ( node.type === 'ThrowStatement' ) {
				// we only care about errors thrown at the top level, otherwise
				// any function with error checking gets included if called
				if ( scope.isTopLevel ) hasSideEffect = true;
			}

			else if ( node.type === 'CallExpression' || node.type === 'NewExpression' ) {
				if ( node.callee.type === 'Identifier' ) {
					const declaration = scope.findDeclaration( node.callee.name ) ||
					                    statement.module.trace( node.callee.name );

					if ( declaration ) {
						if ( declaration.run( strongDependencies ) ) {
							hasSideEffect = true;
						}
					} else if ( !pureFunctions[ node.callee.name ] ) {
						hasSideEffect = true;
					}
				}

				else if ( node.callee.type === 'MemberExpression' ) {
					const flattened = flatten( node.callee );

					if ( flattened ) {
						// if we're calling e.g. Object.keys(thing), there are no side-effects
						// TODO make pureFunctions configurable
						const declaration = scope.findDeclaration( flattened.name ) || statement.module.trace( flattened.name );

						if ( !!declaration || !pureFunctions[ flattened.keypath ] ) {
							hasSideEffect = true;
						}
					} else {
						// is not a keypath like `foo.bar.baz` – could be e.g.
						// `foo[bar].baz()`. Err on the side of caution
						hasSideEffect = true;
					}
				}

				// otherwise we're probably dealing with a function expression
				else if ( run( node.callee, scope, statement, strongDependencies, true ) ) {
					hasSideEffect = true;
				}
			}

			else if ( node.type in modifierNodes ) {
				let subject = node[ modifierNodes[ node.type ] ];
				while ( subject.type === 'MemberExpression' ) subject = subject.object;

				let declaration = scope.findDeclaration( subject.name );

				if ( declaration ) {
					if ( declaration.isParam ) hasSideEffect = true;
				} else {
					declaration = statement.module.trace( subject.name );

					if ( !declaration || declaration.isExternal || declaration.isUsed ) {
						hasSideEffect = true;
					}
				}
			}
		},
		leave ( node ) {
			if ( node._scope ) scope = scope.parent;
		}
	});

	return hasSideEffect;
}
