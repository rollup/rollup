import relativeId from '../../utils/relativeId';
import { Node } from './shared/Node';
import { ObjectPath, UNKNOWN_KEY, UnknownKey } from '../variables/VariableReassignmentTracker';
import Variable from '../variables/Variable';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Literal, { isLiteral } from './Literal';
import CallOptions from '../CallOptions';
import MagicString from 'magic-string';
import Identifier, { isIdentifier } from './Identifier';
import NamespaceVariable from '../variables/NamespaceVariable';
import ExternalVariable from '../variables/ExternalVariable';
import { BasicExpressionNode, ExpressionNode, ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';

const validProp = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

class Keypath {
	computed: boolean;
	parts: (Literal | Identifier)[];
	root: ExpressionNode;

	constructor (node: ExpressionNode) {
		this.parts = [];

		while (isMemberExpression(node)) {
			const prop = node.property;

			if (node.computed) {
				if (
					!isLiteral(prop) ||
					typeof prop.value !== 'string' ||
					!validProp.test(prop.value)
				) {
					this.computed = true;
					return;
				}
			}

			this.parts.unshift(<Literal | Identifier>prop);
			node = node.object;
		}

		this.root = node;
	}
}

// TODO Lukas move to namespace variable
function isNamespaceVariable (variable: Variable): variable is NamespaceVariable {
	return variable.isNamespace;
}

// TODO Lukas move to external variable
function isExternalVariable (variable: Variable): variable is ExternalVariable {
	return variable.isExternal;
}

export function isMemberExpression (node: Node): node is MemberExpression {
	return node.type === 'MemberExpression';
}

export default class MemberExpression extends BasicExpressionNode {
	type: 'MemberExpression';
	object: ExpressionNode;
	property: ExpressionNode;
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

		if (!keypath.computed && isIdentifier(keypath.root)) {
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

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		if (!this._bound) this.bind();
		if (this.variable) {
			this.variable.reassignPath(path, options);
		} else {
			this.object.reassignPath([<string>this._getPathSegment(), ...path], options);
		}
	}

	forEachReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
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

	hasEffectsWhenAccessedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
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

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (this.variable) {
			return this.variable.hasEffectsWhenAssignedAtPath(path, options);
		}
		return this.object.hasEffectsWhenAssignedAtPath(
			[<string>this._getPathSegment(), ...path],
			options
		);
	}

	hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions): boolean {
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
			this.module.graph.treeshake &&
			this.module.graph.treeshakingOptions.propertyReadSideEffects;
	}

	render (code: MagicString, es: boolean) {
		if (this.variable) {
			code.overwrite(this.start, this.end, this.variable.getName(es), {
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
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
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
