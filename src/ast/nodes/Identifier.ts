import isReference from 'is-reference';
import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import CallOptions from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import FunctionScope from '../scopes/FunctionScope';
import { ImmutableEntityPathTracker } from '../utils/ImmutableEntityPathTracker';
import { LiteralValueOrUnknown, ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../values';
import LocalVariable from '../variables/LocalVariable';
import Variable from '../variables/Variable';
import AssignmentPattern from './AssignmentPattern';
import * as NodeType from './NodeType';
import Property from './Property';
import { ExpressionEntity } from './shared/Expression';
import { Node, NodeBase } from './shared/Node';

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
		if (
			this.variable !== null &&
			(<LocalVariable>this.variable).isLocal &&
			(<LocalVariable>this.variable).additionalInitializers !== null
		) {
			(<LocalVariable>this.variable).consolidateInitializers();
		}
	}

	declare(kind: string, init: ExpressionEntity) {
		switch (kind) {
			case 'var':
			case 'function':
				this.variable = this.scope.addDeclaration(
					this,
					this.context.deoptimizationTracker,
					init,
					true
				);
				break;
			case 'let':
			case 'const':
			case 'class':
				this.variable = this.scope.addDeclaration(
					this,
					this.context.deoptimizationTracker,
					init,
					false
				);
				break;
			case 'parameter':
				this.variable = (<FunctionScope>this.scope).addParameterDeclaration(this);
				break;
			default:
				throw new Error(`Unexpected identifier kind ${kind}.`);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.variable !== null) {
			return this.variable.getLiteralValueAtPath(path, recursionTracker, origin);
		}
		return UNKNOWN_VALUE;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	) {
		if (this.variable !== null) {
			return this.variable.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
		}
		return UNKNOWN_EXPRESSION;
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

	deoptimizePath(path: ObjectPath) {
		if (!this.bound) this.bind();
		if (this.variable !== null) {
			if (
				path.length === 0 &&
				this.name in this.context.imports &&
				!this.scope.contains(this.name)
			) {
				this.disallowImportReassignment();
			}
			this.variable.deoptimizePath(path);
		}
	}

	render(
		code: MagicString,
		_options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (this.variable) {
			const name = this.variable.getName();

			if (name !== this.name) {
				code.overwrite(this.start, this.end, name, {
					storeName: true,
					contentOnly: true
				});
				let relevantParent = this.parent;
				if (relevantParent.type === NodeType.AssignmentPattern) {
					relevantParent = (<AssignmentPattern>relevantParent).parent;
				}
				if (relevantParent.type === NodeType.Property && (<Property>relevantParent).shorthand) {
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
		}
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
}
