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
import { UNDEFINED_EXPRESSION } from '../values';
import GlobalVariable from '../variables/GlobalVariable';
import LocalVariable from '../variables/LocalVariable';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import SpreadElement from './SpreadElement';
import { ExpressionEntity, LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export type IdentifierWithVariable = Identifier & { variable: Variable };

const tdzInitTypesToIgnore = {
	__proto__: null,
	ArrowFunctionExpression: true,
	ClassExpression: true,
	FunctionExpression: true,
	ObjectExpression: true
};

const variableKinds = {
	__proto__: null,
	const: true,
	let: true,
	var: true
};

export default class Identifier extends NodeBase implements PatternNode {
	TDZ: boolean | undefined = undefined;
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

	bind(): void {
		if (this.variable === null && isReference(this, this.parent as any)) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
		}
	}

	declare(kind: string, init: ExpressionEntity): LocalVariable[] {
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
		variable.kind = kind;
		return [(this.variable = variable)];
	}

	deoptimizePath(path: ObjectPath): void {
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
	): void {
		this.variable!.deoptimizeThisOnEventAtPath(event, path, thisParameter, recursionTracker);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.isPossibleTDZ()) {
			return UnknownValue;
		}
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
		if (this.isPossibleTDZ()) {
			return true;
		}
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
	): boolean {
		return !this.variable || this.variable.hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	include(): void {
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
	): void {
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

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		if (this.variable !== null && this.variable instanceof LocalVariable) {
			this.variable.consolidateInitializers();
			this.context.requestTreeshakingPass();
		}
	}

	protected isPossibleTDZ(): boolean {
		// return cached value if present
		if (this.TDZ !== undefined) return this.TDZ;

		if (
			!(this.variable instanceof LocalVariable) ||
			!this.variable.kind ||
			!(this.variable.kind in variableKinds)
		) {
			return (this.TDZ = false);
		}

		if (
			this.variable.kind === 'var' &&
			((this.parent.type === 'AssignmentExpression' && this === (this.parent as any).left) ||
				(this.parent.type === 'UpdateExpression' && this === (this.parent as any).argument) ||
				this.parent.type === 'SequenceExpression' ||
				this.parent.type === 'ExpressionStatement')
		) {
			// If a `var` variable is modified or innocuous
			// then pretend the init was reached in these cases
			// and have rollup's treeshaking take care of it.
			this.variable.initReached = true;
			return (this.TDZ = false);
		}

		if (!this.variable.initReached) {
			// Either a const/let TDZ violation or
			// var use before declaration was encountered.
			// Retain this variable accesss to preserve the input behavior.
			return (this.TDZ = true);
		}

		let init, init_parent;
		if (
			(init = (this.variable as any).init) &&
			init !== UNDEFINED_EXPRESSION &&
			(init_parent = (init as any).parent) &&
			init_parent.type == 'VariableDeclarator' &&
			init_parent.id.variable === this.variable &&
			!(init_parent.init.type in tdzInitTypesToIgnore) &&
			// code position comparisons must be in the same context
			this.context === init_parent.id.context &&
			this.start >= init.start &&
			this.start < init.end
		) {
			// any scope variable access within its own declaration init:
			//   let x = x + 1;
			return (this.TDZ = true);
		}

		return (this.TDZ = false);
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
