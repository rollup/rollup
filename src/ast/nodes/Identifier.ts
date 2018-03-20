import { Node, NodeBase } from './shared/Node';
import isReference from 'is-reference';
import { ObjectPath, UNKNOWN_EXPRESSION } from '../values';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Variable from '../variables/Variable';
import CallOptions from '../CallOptions';
import FunctionScope from '../scopes/FunctionScope';
import MagicString from 'magic-string';
import Property from './Property';
import {
	ExpressionEntity,
	ForEachReturnExpressionCallback,
	SomeReturnExpressionCallback
} from './shared/Expression';
import { NodeType } from './NodeType';
import AssignmentExpression from './AssignmentExpression';
import UpdateExpression from './UpdateExpression';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import Import from './Import';
import { BLANK } from '../../utils/blank';

export function isIdentifier(node: Node): node is Identifier {
	return node.type === NodeType.Identifier;
}

export default class Identifier extends NodeBase {
	type: NodeType.Identifier;
	name: string;

	variable: Variable;
	private isBound: boolean;

	bindNode() {
		if (isReference(this, this.parent)) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
		}
	}

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (!this.isBound) this.bind();
		this.variable &&
			this.variable.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return this.variable && this.variable.hasEffectsWhenAccessedAtPath(path, options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return !this.variable || this.variable.hasEffectsWhenAssignedAtPath(path, options);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	) {
		return !this.variable || this.variable.hasEffectsWhenCalledAtPath(path, callOptions, options);
	}

	includeInBundle() {
		if (this.included) return false;
		this.included = true;
		this.variable && this.variable.includeVariable();
		return true;
	}

	initialiseAndDeclare(
		parentScope: Scope,
		_dynamicImportReturnList: Import[],
		kind: string,
		init: ExpressionEntity | null
	) {
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

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (!this.isBound) this.bind();
		if (this.variable) {
			if (path.length === 0) this.disallowImportReassignment();
			this.variable.reassignPath(path, options);
		}
	}

	private disallowImportReassignment() {
		if (this.module.imports[this.name] && !this.scope.contains(this.name)) {
			this.module.error(
				{
					code: 'ILLEGAL_REASSIGNMENT',
					message: `Illegal reassignment to import '${this.name}'`
				},
				this.start
			);
		}
	}

	renderSystemBindingUpdate(code: MagicString, name: string) {
		switch (this.parent.type) {
			case NodeType.AssignmentExpression:
				{
					let expression: AssignmentExpression = <AssignmentExpression>this.parent;
					if (expression.left === this) {
						code.prependLeft(expression.right.start, `exports('${this.variable.exportName}', `);
						code.prependRight(expression.right.end, `)`);
					}
				}
				break;

			case NodeType.UpdateExpression:
				{
					let expression: UpdateExpression = <UpdateExpression>this.parent;
					if (expression.prefix) {
						code.overwrite(
							expression.start,
							expression.end,
							`exports('${this.variable.exportName}', ${expression.operator}${name})`
						);
					} else {
						let op;
						switch (expression.operator) {
							case '++':
								op = `${name} + 1`;
								break;
							case '--':
								op = `${name} - 1`;
								break;
							case '**':
								op = `${name} * ${name}`;
								break;
						}
						code.overwrite(
							expression.start,
							expression.end,
							`(exports('${this.variable.exportName}', ${op}), ${name}${expression.operator})`
						);
					}
				}
				break;
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (this.variable) {
			const name = this.variable.getName();

			if (name !== this.name) {
				code.overwrite(this.start, this.end, name, {
					storeName: true,
					contentOnly: true
				});
				if (this.parent.type === NodeType.Property && (<Property>this.parent).shorthand) {
					code.prependRight(this.start, `${this.name}: `);
				}
			}
			// In strict mode, any variable named "eval" must be the actual "eval" function
			if (
				name === 'eval' &&
				renderedParentType === NodeType.CallExpression &&
				isCalleeOfRenderedParent
			) {
				code.appendRight(this.start, '0, ');
			}
			if (options.systemBindings && this.variable.exportName) {
				this.renderSystemBindingUpdate(code, name);
			}
		}
	}

	someReturnExpressionWhenCalledAtPath(
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
