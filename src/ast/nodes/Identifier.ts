import isReference from 'is-reference';
import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import FunctionScope from '../scopes/FunctionScope';
import { LiteralValueOrUnknown, ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../values';
import Variable from '../variables/Variable';
import AssignmentExpression from './AssignmentExpression';
import * as NodeType from './NodeType';
import Property from './Property';
import {
	ExpressionEntity,
	ForEachReturnExpressionCallback,
	SomeReturnExpressionCallback
} from './shared/Expression';
import { Node, NodeBase } from './shared/Node';
import UpdateExpression from './UpdateExpression';

export function isIdentifier(node: Node): node is Identifier {
	return node.type === NodeType.Identifier;
}

export default class Identifier extends NodeBase {
	type: NodeType.tIdentifier;
	name: string;

	variable: Variable;
	private bound: boolean;

	bind() {
		if (this.bound) return;
		this.bound = true;
		if (this.variable === null && isReference(this, this.parent)) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
		}
	}

	declare(kind: string, init: ExpressionEntity | null) {
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

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (!this.bound) this.bind();
		if (this.variable !== null) {
			this.variable.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
		}
	}

	getLiteralValueAtPath(path: ObjectPath, options: ExecutionPathOptions): LiteralValueOrUnknown {
		if (this.variable !== null) {
			return this.variable.getLiteralValueAtPath(path, options);
		}
		return UNKNOWN_VALUE;
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

	include() {
		if (!this.included) {
			this.included = true;
			if (this.variable !== null && !this.variable.included) {
				this.variable.include();
				this.context.requestTreeshakingPass();
			}
		}
	}

	initialise() {
		this.included = false;
		this.bound = false;
		// To avoid later shape mutations
		if (!this.variable) {
			this.variable = null;
		}
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (!this.bound) this.bind();
		if (this.variable !== null) {
			if (
				path.length === 0 &&
				this.name in this.context.imports &&
				!this.scope.contains(this.name)
			) {
				this.disallowImportReassignment();
			}
			this.variable.reassignPath(path, options);
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
			if (options.format === 'system' && this.variable.exportName) {
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
		return predicateFunction(options, UNKNOWN_EXPRESSION);
	}

	private disallowImportReassignment() {
		this.context.error(
			{
				code: 'ILLEGAL_REASSIGNMENT',
				message: `Illegal reassignment to import '${this.name}'`
			},
			this.start
		);
	}

	private renderSystemBindingUpdate(code: MagicString, name: string) {
		switch (this.parent.type) {
			case NodeType.AssignmentExpression:
				{
					const expression: AssignmentExpression = <AssignmentExpression>this.parent;
					if (expression.left === this) {
						code.prependLeft(expression.right.start, `exports('${this.variable.exportName}', `);
						code.prependRight(expression.right.end, `)`);
					}
				}
				break;

			case NodeType.UpdateExpression:
				{
					const expression: UpdateExpression = <UpdateExpression>this.parent;
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
}
