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
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';
import SpreadElement from './SpreadElement';

export type IdentifierWithVariable = Identifier & { variable: Variable };

export default class Identifier extends NodeBase implements PatternNode {
	name!: string;
	type!: NodeType.tIdentifier;

	variable: Variable | null = null;
	private bound = false;

	addExportedVariables(variables: Variable[]): void {
		if (this.variable !== null && this.variable.exportName) {
			variables.push(this.variable);
		}
	}

	bind() {
		if (this.bound) return;
		this.bound = true;
		if (this.variable === null && isReference(this, this.parent)) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
		}
		if (
			this.variable !== null &&
			this.variable instanceof LocalVariable &&
			this.variable.additionalInitializers !== null
		) {
			this.variable.consolidateInitializers();
		}
	}

	declare(kind: string, init: ExpressionEntity) {
		let variable: LocalVariable;
		switch (kind) {
			case 'var':
			case 'function':
				variable = this.scope.addDeclaration(this, this.context, init, true);
				break;
			case 'let':
			case 'const':
			case 'class':
				variable = this.scope.addDeclaration(this, this.context, init, false);
				break;
			case 'parameter':
				variable = (this.scope as FunctionScope).addParameterDeclaration(this);
				break;
			default:
				throw new Error(`Unexpected identifier kind ${kind}.`);
		}
		return [(this.variable = variable)];
	}

	deoptimizePath(path: ObjectPath) {
		if (!this.bound) this.bind();
		if (this.variable !== null) {
			if (
				path.length === 0 &&
				this.name in this.context.importDescriptions &&
				!this.scope.contains(this.name)
			) {
				this.disallowImportReassignment();
			}
			this.variable.deoptimizePath(path);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (!this.bound) this.bind();
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
		if (!this.bound) this.bind();
		if (this.variable !== null) {
			return this.variable.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return this.variable !== null && this.variable.hasEffectsWhenAccessedAtPath(path, options);
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
			if (this.variable !== null) {
				this.context.includeVariable(this.variable);
			}
		}
	}

	includeCallArguments(args: (ExpressionNode | SpreadElement)[]): void {
		if (this.variable) {
			this.variable.includeCallArguments(args);
		}
	}

	render(
		code: MagicString,
		_options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent, isShorthandProperty }: NodeRenderOptions = BLANK
	) {
		if (this.variable) {
			const name = this.variable.getName();

			if (name !== this.name) {
				code.overwrite(this.start, this.end, name, {
					contentOnly: true,
					storeName: true
				});
				if (isShorthandProperty) {
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
