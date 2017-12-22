import relativeId from '../../utils/relativeId';
import Node from '../Node';
import { UNKNOWN_KEY, UnknownKey } from '../variables/VariableReassignmentTracker';
import Expression from './Expression';
import Variable from '../variables/Variable';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Literal from './Literal';
import CallOptions from '../CallOptions';
import { PredicateFunction } from '../values';
import MagicString from 'magic-string';
import Identifier from './Identifier';
import NamespaceVariable from '../variables/NamespaceVariable';
import ExternalVariable from '../variables/ExternalVariable';

const validProp = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

class Keypath {
	computed: boolean;
	parts: (Literal | Identifier)[];
	root: Expression;

	constructor (node: MemberExpression) {
		this.parts = [];

		while (node.type === 'MemberExpression') {
			const prop = (<MemberExpression>node).property;

			if (node.computed) {
				if (
					prop.type !== 'Literal' ||
					typeof prop.value !== 'string' ||
					!validProp.test(prop.value)
				) {
					this.computed = true;
					return;
				}
			}

			this.parts.unshift(<Literal | Identifier>prop);
			node = <MemberExpression>(node.object);
		}

		this.root = node;
	}
}

function isNamespaceVariable (variable: Variable): variable is NamespaceVariable {
	return variable.isNamespace;
}
function isExternalVariable (variable: Variable): variable is ExternalVariable {
	return variable.isExternal;
}

export default class MemberExpression extends Node {
	type: 'MemberExpression';
	object: Expression;
	property: Expression;
	computed: boolean;

	private _bound: boolean;
	variable: Variable;
	replacement: string;

	private _checkPropertyReadSideEffects: boolean;

	bind () {
		// if this resolves to a namespaced declaration, prepare
		// to replace it
		// TODO this code is a bit inefficient
		this._bound = true;
		const keypath = new Keypath(this);

		if (!keypath.computed && keypath.root.type === 'Identifier') {
			let variable: Variable = this.scope.findVariable(keypath.root.name);

			while (isNamespaceVariable(variable) && keypath.parts.length) {
				const exporterId = variable.module.id;

				const part = keypath.parts[0];
				variable = variable.module.traceExport((<Identifier>part).name || <string>(<Literal>part).value);

				if (!variable) {
					this.module.warn(
						{
							code: 'MISSING_EXPORT',
							missing: (<Identifier>part).name || <string>(<Literal>part).value,
							importer: relativeId(this.module.id),
							exporter: relativeId(exporterId),
							message: `'${(<Identifier>part).name || (<Literal>part).value}' is not exported by '${relativeId(exporterId)}'`,
							url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
						},
						part.start
					);
					this.replacement = 'undefined';
					return;
				}

				keypath.parts.shift();
			}

			if (keypath.parts.length) {
				super.bind();
				return; // not a namespaced declaration
			}

			this.variable = variable;

			if (isExternalVariable(variable)) {
				variable.module.suggestName(keypath.root.name);
			}
		} else {
			super.bind();
		}
	}

	reassignPath (path: string[], options: ExecutionPathOptions) {
		if (!this._bound) this.bind();
		if (this.variable) {
			this.variable.reassignPath(path, options);
		} else {
			this.object.reassignPath([<string>this._getPathSegment(), ...path], options);
		}
	}

	forEachReturnExpressionWhenCalledAtPath (
		path: string[],
		callOptions: CallOptions,
		callback: (options: ExecutionPathOptions) => (node: Node) => void,
		options: ExecutionPathOptions
	) {
		if (!this._bound) this.bind();
		if (this.variable) {
			this.variable.forEachReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				callback,
				options
			);
		} else {
			// TODO: Type failure for ArrowFunctionExpression, FunctionExpression member object
			this.object.forEachReturnExpressionWhenCalledAtPath(
				[<string>this._getPathSegment(), ...path],
				callOptions,
				callback,
				options
			);
		}
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			super.hasEffects(options) ||
			(this._checkPropertyReadSideEffects &&
				this.object.hasEffectsWhenAccessedAtPath(
					[<string>this._getPathSegment()],
					options
				))
		);
	}

	hasEffectsWhenAccessedAtPath (path: string[], options: ExecutionPathOptions): boolean {
		if (path.length === 0) {
			return false;
		}
		if (this.variable) {
			return this.variable.hasEffectsWhenAccessedAtPath(path, options);
		}
		return this.object.hasEffectsWhenAccessedAtPath(
			[<string>this._getPathSegment(), ...path],
			options
		);
	}

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions): boolean {
		if (this.variable) {
			return this.variable.hasEffectsWhenAssignedAtPath(path, options);
		}
		return this.object.hasEffectsWhenAssignedAtPath(
			[<string>this._getPathSegment(), ...path],
			options
		);
	}

	hasEffectsWhenCalledAtPath (path: string[], callOptions: CallOptions, options: ExecutionPathOptions): boolean {
		if (this.variable) {
			return this.variable.hasEffectsWhenCalledAtPath(
				path,
				callOptions,
				options
			);
		}
		return (
			this._getPathSegment() === UNKNOWN_KEY ||
			this.object.hasEffectsWhenCalledAtPath(
				[<string>this._getPathSegment(), ...path],
				callOptions,
				options
			)
		);
	}

	includeInBundle () {
		let addedNewNodes = super.includeInBundle();
		if (this.variable && !this.variable.included) {
			this.variable.includeVariable();
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	initialiseNode () {
		this._checkPropertyReadSideEffects =
			this.module.bundle.treeshake &&
			this.module.bundle.treeshakingOptions.propertyReadSideEffects;
	}

	render (code: MagicString, es: boolean) {
		if (this.variable) {
			const name = this.variable.getName(es);
			if (name !== this.name)
				code.overwrite(this.start, this.end, name, {
					storeName: true,
					contentOnly: false
				});
		} else if (this.replacement) {
			code.overwrite(this.start, this.end, this.replacement, {
				storeName: true,
				contentOnly: false
			});
		}

		super.render(code, es);
	}

	someReturnExpressionWhenCalledAtPath (
		path: string[],
		callOptions: CallOptions,
		predicateFunction: (options: ExecutionPathOptions) => PredicateFunction,
		options: ExecutionPathOptions
	): boolean {
		if (this.variable) {
			return this.variable.someReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				predicateFunction,
				options
			);
		}
		return (
			this._getPathSegment() === UNKNOWN_KEY ||
			this.object.someReturnExpressionWhenCalledAtPath(
				[<string>this._getPathSegment(), ...path],
				callOptions,
				predicateFunction,
				options
			)
		);
	}

	_getPathSegment (): string | UnknownKey {
		if (this.computed) {
			return this.property.type === 'Literal'
				? String((<Literal>this.property).value)
				: UNKNOWN_KEY;
		}
		return (<Identifier>this.property).name;
	}
}
