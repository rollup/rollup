import isReference from 'is-reference';
import MagicString from 'magic-string';
import { NormalizedTreeshakingOptions } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { NodeEvent } from '../NodeEvents';
import FunctionScope from '../scopes/FunctionScope';
import { EMPTY_PATH, ObjectPath, PathTracker } from '../utils/PathTracker';
import GlobalVariable from '../variables/GlobalVariable';
import LocalVariable from '../variables/LocalVariable';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionEntity, LiteralValueOrUnknown } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';
import SpreadElement from './SpreadElement';

export type IdentifierWithVariable = Identifier & { variable: Variable };

export default class Identifier extends NodeBase implements PatternNode {
	name!: string;
	type!: NodeType.tIdentifier;

	variable: Variable | null = null;
	protected deoptimized = false;

	addExportedVariables(
		variables: Variable[],
		exportNamesByVariable: Map<Variable, string[]>
	): void {
		if (this.variable !== null && exportNamesByVariable.has(this.variable)) {
			variables.push(this.variable);
		}
	}

	bind() {
		if (this.variable === null && isReference(this, this.parent as any)) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
		}
	}

	declare(kind: string, init: ExpressionEntity) {
		let variable: LocalVariable;
		switch (kind) {
			case 'var':
				variable = this.scope.addDeclaration(this, this.context, init, true);
				break;
			case 'function':
				// in strict mode, functions are only hoisted within a scope but not across block scopes
				variable = this.scope.addDeclaration(this, this.context, init, false);
				break;
			case 'let':
			case 'const':
			case 'class':
				variable = this.scope.addDeclaration(this, this.context, init, false);
				break;
			case 'parameter':
				variable = (this.scope as FunctionScope).addParameterDeclaration(this);
				break;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				throw new Error(`Internal Error: Unexpected identifier kind ${kind}.`);
		}
		return [(this.variable = variable)];
	}

	deoptimizePath(path: ObjectPath) {
		if (path.length === 0 && !this.scope.contains(this.name)) {
			this.disallowImportReassignment();
		}
		this.variable!.deoptimizePath(path);
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	) {
		this.variable!.deoptimizeThisOnEventAtPath(event, path, thisParameter, recursionTracker);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.variable!.getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.variable!.getReturnExpressionWhenCalledAtPath(
			path,
			callOptions,
			recursionTracker,
			origin
		);
	}

	hasEffects(): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return (
			(this.context.options.treeshake as NormalizedTreeshakingOptions).unknownGlobalSideEffects &&
			this.variable instanceof GlobalVariable &&
			this.variable.hasEffectsWhenAccessedAtPath(EMPTY_PATH)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return this.variable !== null && this.variable.hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return !this.variable || this.variable.hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		return !this.variable || this.variable.hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	include() {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) {
			this.included = true;
			if (this.variable !== null) {
				this.context.includeVariableInModule(this.variable);
			}
		}
	}

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]): void {
		this.variable!.includeCallArguments(context, args);
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

	protected applyDeoptimizations() {
		this.deoptimized = true;
		if (
			this.variable !== null &&
			this.variable instanceof LocalVariable
		) {
			this.variable.consolidateInitializers();
		}
	}

	private disallowImportReassignment() {
		return this.context.error(
			{
				code: 'ILLEGAL_REASSIGNMENT',
				message: `Illegal reassignment to import '${this.name}'`
			},
			this.start
		);
	}
}
