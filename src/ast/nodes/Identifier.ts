/// <reference path="./Identifier.d.ts" />

import { Node } from './shared/Node';
import isReference from 'is-reference';
import { UNKNOWN_EXPRESSION } from '../values';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Variable from '../variables/Variable';
import CallOptions from '../CallOptions';
import FunctionScope from '../scopes/FunctionScope';
import MagicString from 'magic-string';
import Property from './Property';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { BasicExpressionNode, Expression, ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import { Pattern } from './shared/Pattern';

export function isIdentifier (node: Node): node is Identifier {
	return node.type === 'Identifier';
}

export default class Identifier extends BasicExpressionNode implements Pattern {
	type: 'Identifier';
	name: string;

	variable: Variable;

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		this._bindVariableIfMissing();
		this.variable && this.variable.reassignPath(path, options);
	}

	bindNode () {
		this._bindVariableIfMissing();
	}

	_bindVariableIfMissing () {
		if (!this.variable && isReference(this, this.parent)) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
		}
	}

	forEachReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		this._bindVariableIfMissing();
		this.variable &&
		this.variable.forEachReturnExpressionWhenCalledAtPath(
			path,
			callOptions,
			callback,
			options
		);
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			this.variable && this.variable.hasEffectsWhenAccessedAtPath(path, options)
		);
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			!this.variable ||
			this.variable.hasEffectsWhenAssignedAtPath(path, options)
		);
	}

	hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions) {
		return (
			!this.variable ||
			this.variable.hasEffectsWhenCalledAtPath(path, callOptions, options)
		);
	}

	includeInBundle () {
		if (this.included) return false;
		this.included = true;
		this.variable && this.variable.includeVariable();
		return true;
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, init: Expression | null) {
		this.initialiseScope(parentScope);
		switch (kind) {
			case 'var':
			case 'function':
				this.variable = this.scope.addDeclaration(this, {
					isHoisted: true,
					init
				});
				break;
			case 'let':
			case 'const':
			case 'class':
				this.variable = this.scope.addDeclaration(this, { init });
				break;
			case 'parameter':
				this.variable = (<FunctionScope>this.scope).addParameterDeclaration(this);
				break;
			default:
				throw new Error(`Unexpected identifier kind ${kind}.`);
		}
	}

	render (code: MagicString, es: boolean) {
		if (this.variable) {
			const name = this.variable.getName(es);
			if (name !== this.name) {
				code.overwrite(this.start, this.end, name, {
					storeName: true,
					contentOnly: false
				});

				// special case
				if (this.parent.type === 'Property' && (<Property>this.parent).shorthand) {
					code.appendLeft(this.start, `${this.name}: `);
				}
			}
		}
	}

	someReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (this.variable) {
			return this.variable.someReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				predicateFunction,
				options
			);
		}
		return predicateFunction(options)(UNKNOWN_EXPRESSION);
	}
}
