import isReference, { NodeWithFieldDefinition } from 'is-reference';
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
import SpreadElement from './SpreadElement';
import { ExpressionEntity, LiteralValueOrUnknown, UNKNOWN_EXPRESSION } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export type IdentifierWithVariable = Identifier & { variable: Variable };

const tdzVariableKinds = {
	__proto__: null,
	class: true,
	const: true,
	let: true,
	var: true
};

export default class Identifier extends NodeBase implements PatternNode {
	declare name: string;
	declare type: NodeType.tIdentifier;
	variable: Variable | null = null;
	protected deoptimized = false;
	private isTDZAccess: boolean | null = null;

	addExportedVariables(
		variables: Variable[],
		exportNamesByVariable: Map<Variable, string[]>
	): void {
		if (this.variable !== null && exportNamesByVariable.has(this.variable)) {
			variables.push(this.variable);
		}
	}

	bind(): void {
		if (this.variable === null && isReference(this, this.parent as NodeWithFieldDefinition)) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
		}
	}

	declare(kind: string, init: ExpressionEntity): LocalVariable[] {
		let variable: LocalVariable;
		const { treeshake } = this.context.options;
		switch (kind) {
			case 'var':
				variable = this.scope.addDeclaration(this, this.context, init, true);
				if (treeshake && treeshake.correctVarValueBeforeDeclaration) {
					// Necessary to make sure the init is deoptimized. We cannot call deoptimizePath here.
					variable.markInitializersForDeoptimization();
				}
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
		return this.getVariableRespectingTDZ().getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.getVariableRespectingTDZ().getReturnExpressionWhenCalledAtPath(
			path,
			callOptions,
			recursionTracker,
			origin
		);
	}

	hasEffects(): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (this.isPossibleTDZ() && this.variable!.kind !== 'var') {
			return true;
		}
		return (
			(this.context.options.treeshake as NormalizedTreeshakingOptions).unknownGlobalSideEffects &&
			this.variable instanceof GlobalVariable &&
			this.variable.hasEffectsWhenAccessedAtPath(EMPTY_PATH)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return (
			this.variable !== null &&
			this.getVariableRespectingTDZ().hasEffectsWhenAccessedAtPath(path, context)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return (
			!this.variable ||
			(path.length > 0
				? this.getVariableRespectingTDZ()
				: this.variable
			).hasEffectsWhenAssignedAtPath(path, context)
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		return (
			!this.variable ||
			this.getVariableRespectingTDZ().hasEffectsWhenCalledAtPath(path, callOptions, context)
		);
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
		this.getVariableRespectingTDZ().includeCallArguments(context, args);
	}

	isPossibleTDZ(): boolean {
		// return cached value to avoid issues with the next tree-shaking pass
		if (this.isTDZAccess !== null) return this.isTDZAccess;

		if (
			!(this.variable instanceof LocalVariable) ||
			!this.variable.kind ||
			!(this.variable.kind in tdzVariableKinds)
		) {
			return (this.isTDZAccess = false);
		}

		let decl_id;
		if (
			this.variable.declarations &&
			this.variable.declarations.length === 1 &&
			(decl_id = this.variable.declarations[0] as any) &&
			this.start < decl_id.start &&
			closestParentFunctionOrProgram(this) === closestParentFunctionOrProgram(decl_id)
		) {
			// a variable accessed before its declaration
			// in the same function or at top level of module
			return (this.isTDZAccess = true);
		}

		if (!this.variable.initReached) {
			// Either a const/let TDZ violation or
			// var use before declaration was encountered.
			return (this.isTDZAccess = true);
		}

		return (this.isTDZAccess = false);
	}

	markDeclarationReached(): void {
		this.variable!.initReached = true;
	}

	render(
		code: MagicString,
		{ snippets: { getPropertyAccess } }: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent, isShorthandProperty }: NodeRenderOptions = BLANK
	): void {
		if (this.variable) {
			const name = this.variable.getName(getPropertyAccess);

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

	private disallowImportReassignment() {
		return this.context.error(
			{
				code: 'ILLEGAL_REASSIGNMENT',
				message: `Illegal reassignment to import '${this.name}'`
			},
			this.start
		);
	}

	private getVariableRespectingTDZ(): ExpressionEntity {
		if (this.isPossibleTDZ()) {
			return UNKNOWN_EXPRESSION;
		}
		return this.variable!;
	}
}

function closestParentFunctionOrProgram(node: any): any {
	while (node && !/^Program|Function/.test(node.type)) {
		node = node.parent;
	}
	// one of: ArrowFunctionExpression, FunctionDeclaration, FunctionExpression or Program
	return node;
}
