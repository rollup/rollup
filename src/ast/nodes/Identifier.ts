import isReference, { type NodeWithFieldDefinition } from 'is-reference';
import type MagicString from 'magic-string';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import { logIllegalImportReassignment } from '../../utils/logs';
import { PureFunctionKey } from '../../utils/pureFunctions';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { markModuleAndImpureDependenciesAsExecuted } from '../../utils/traverseStaticDependencies';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	INTERACTION_CALLED,
	NODE_INTERACTION_UNKNOWN_ACCESS
} from '../NodeInteractions';
import type FunctionScope from '../scopes/FunctionScope';
import { EMPTY_PATH, type ObjectPath, type PathTracker } from '../utils/PathTracker';
import GlobalVariable from '../variables/GlobalVariable';
import LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import {
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION
} from './shared/Expression';
import { NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';
import type SpreadElement from './SpreadElement';

export type IdentifierWithVariable = Identifier & { variable: Variable };

const tdzVariableKinds = new Set(['class', 'const', 'let', 'var', 'using', 'await using']);

export default class Identifier extends NodeBase implements PatternNode {
	declare name: string;
	declare type: NodeType.tIdentifier;
	variable: Variable | null = null;

	private get isTDZAccess(): boolean | null {
		if (!isFlagSet(this.flags, Flag.tdzAccessDefined)) {
			return null;
		}
		return isFlagSet(this.flags, Flag.tdzAccess);
	}
	private set isTDZAccess(value: boolean) {
		this.flags = setFlag(this.flags, Flag.tdzAccessDefined, true);
		this.flags = setFlag(this.flags, Flag.tdzAccess, value);
	}

	addExportedVariables(
		variables: Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		if (exportNamesByVariable.has(this.variable!)) {
			variables.push(this.variable!);
		}
	}

	private isReferenceVariable = false;
	bind(): void {
		if (!this.variable && isReference(this, this.parent as NodeWithFieldDefinition)) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
			this.isReferenceVariable = true;
		}
	}

	declare(kind: VariableKind, init: ExpressionEntity): LocalVariable[] {
		let variable: LocalVariable;
		const { treeshake } = this.scope.context.options;
		switch (kind) {
			case 'var': {
				variable = this.scope.addDeclaration(this, this.scope.context, init, kind);
				if (treeshake && treeshake.correctVarValueBeforeDeclaration) {
					// Necessary to make sure the init is deoptimized. We cannot call deoptimizePath here.
					variable.markInitializersForDeoptimization();
				}
				break;
			}
			case 'function': {
				// in strict mode, functions are only hoisted within a scope but not across block scopes
				variable = this.scope.addDeclaration(this, this.scope.context, init, kind);
				break;
			}
			case 'let':
			case 'const':
			case 'using':
			case 'await using':
			case 'class': {
				variable = this.scope.addDeclaration(this, this.scope.context, init, kind);
				break;
			}
			case 'parameter': {
				variable = (this.scope as FunctionScope).addParameterDeclaration(this);
				break;
			}
			/* istanbul ignore next */
			default: {
				/* istanbul ignore next */
				throw new Error(`Internal Error: Unexpected identifier kind ${kind}.`);
			}
		}
		return [(this.variable = variable)];
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		this.variable!.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0 && !this.scope.contains(this.name)) {
			this.disallowImportReassignment();
		}
		// We keep conditional chaining because an unknown Node could have an
		// Identifier as property that might be deoptimized by default
		this.variable?.deoptimizePath(path);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getVariableRespectingTDZ()!.getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		const [expression, isPure] =
			this.getVariableRespectingTDZ()!.getReturnExpressionWhenCalledAtPath(
				path,
				interaction,
				recursionTracker,
				origin
			);
		return [expression, isPure || this.isPureFunction(path)];
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (this.isPossibleTDZ() && this.variable!.kind !== 'var') {
			return true;
		}
		return (
			(this.scope.context.options.treeshake as NormalizedTreeshakingOptions)
				.unknownGlobalSideEffects &&
			this.variable instanceof GlobalVariable &&
			!this.isPureFunction(EMPTY_PATH) &&
			this.variable.hasEffectsOnInteractionAtPath(
				EMPTY_PATH,
				NODE_INTERACTION_UNKNOWN_ACCESS,
				context
			)
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		switch (interaction.type) {
			case INTERACTION_ACCESSED: {
				return (
					this.variable !== null &&
					!this.isPureFunction(path) &&
					this.getVariableRespectingTDZ()!.hasEffectsOnInteractionAtPath(path, interaction, context)
				);
			}
			case INTERACTION_ASSIGNED: {
				return (
					path.length > 0 ? this.getVariableRespectingTDZ() : this.variable
				)!.hasEffectsOnInteractionAtPath(path, interaction, context);
			}
			case INTERACTION_CALLED: {
				return (
					!this.isPureFunction(path) &&
					this.getVariableRespectingTDZ()!.hasEffectsOnInteractionAtPath(path, interaction, context)
				);
			}
		}
	}

	include(): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) {
			this.included = true;
			if (this.variable !== null) {
				this.scope.context.includeVariableInModule(this.variable);
			}
		}
	}

	includeCallArguments(
		context: InclusionContext,
		parameters: readonly (ExpressionEntity | SpreadElement)[]
	): void {
		this.variable!.includeCallArguments(context, parameters);
	}

	isPossibleTDZ(): boolean {
		// return cached value to avoid issues with the next tree-shaking pass
		const cachedTdzAccess = this.isTDZAccess;
		if (cachedTdzAccess !== null) return cachedTdzAccess;

		if (
			!(
				this.variable instanceof LocalVariable &&
				this.variable.kind &&
				tdzVariableKinds.has(this.variable.kind) &&
				// We ignore modules that did not receive a treeshaking pass yet as that
				// causes many false positives due to circular dependencies or disabled
				// moduleSideEffects.
				this.variable.module.hasTreeShakingPassStarted
			)
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
		{ snippets: { getPropertyAccess }, useOriginalName }: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent, isShorthandProperty }: NodeRenderOptions = BLANK
	): void {
		if (this.variable) {
			const name = this.variable.getName(getPropertyAccess, useOriginalName);

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

	private disallowImportReassignment(): never {
		return this.scope.context.error(
			logIllegalImportReassignment(this.name, this.scope.context.module.id),
			this.start
		);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		if (this.variable instanceof LocalVariable) {
			// When accessing a variable from a module without side effects, this
			// means we use an export of that module and therefore need to potentially
			// include it in the bundle.
			if (!this.variable.module.isExecuted) {
				markModuleAndImpureDependenciesAsExecuted(this.variable.module);
			}
			this.variable.consolidateInitializers();
			this.scope.context.requestTreeshakingPass();
		}
		if (this.isReferenceVariable) {
			this.variable!.addUsedPlace(this);
			this.scope.context.requestTreeshakingPass();
		}
	}

	private getVariableRespectingTDZ(): ExpressionEntity | null {
		if (this.isPossibleTDZ()) {
			return UNKNOWN_EXPRESSION;
		}
		return this.variable;
	}

	private isPureFunction(path: ObjectPath) {
		let currentPureFunction = this.scope.context.manualPureFunctions[this.name];
		for (const segment of path) {
			if (currentPureFunction) {
				if (currentPureFunction[PureFunctionKey]) {
					return true;
				}
				currentPureFunction = currentPureFunction[segment as string];
			} else {
				return false;
			}
		}
		return currentPureFunction?.[PureFunctionKey] as boolean;
	}
}

function closestParentFunctionOrProgram(node: any): any {
	while (node && !/^Program|Function/.test(node.type)) {
		node = node.parent;
	}
	// one of: ArrowFunctionExpression, FunctionDeclaration, FunctionExpression or Program
	return node;
}
