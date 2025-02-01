import type { NormalizedTreeshakingOptions } from '../../../rollup/types';
import { logIllegalImportReassignment } from '../../../utils/logs';
import { PureFunctionKey } from '../../../utils/pureFunctions';
import { markModuleAndImpureDependenciesAsExecuted } from '../../../utils/traverseStaticDependencies';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	INTERACTION_CALLED,
	NODE_INTERACTION_UNKNOWN_ACCESS
} from '../../NodeInteractions';
import type { EntityPathTracker, ObjectPath } from '../../utils/PathTracker';
import { EMPTY_PATH } from '../../utils/PathTracker';
import GlobalVariable from '../../variables/GlobalVariable';
import LocalVariable from '../../variables/LocalVariable';
import type Variable from '../../variables/Variable';
import { Flag, isFlagSet, setFlag } from './BitFlags';
import type { ExpressionEntity, LiteralValueOrUnknown } from './Expression';
import { UNKNOWN_EXPRESSION } from './Expression';
import { NodeBase } from './Node';

const tdzVariableKinds = new Set(['class', 'const', 'let', 'var', 'using', 'await using']);

export default class IdentifierBase extends NodeBase {
	name!: string;
	variable: Variable | null = null;

	protected isVariableReference = false;

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

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
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
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getVariableRespectingTDZ()!.getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: EntityPathTracker,
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

	include(context: InclusionContext): void {
		if (!this.included) this.includeNode(context);
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		if (this.variable !== null) {
			this.scope.context.includeVariableInModule(this.variable, EMPTY_PATH, context);
		}
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		if (!this.included) {
			this.included = true;
			if (this.variable !== null) {
				this.scope.context.includeVariableInModule(this.variable, path, context);
			}
		} else if (path.length > 0) {
			this.variable?.includePath(path, context);
		}
	}

	includeCallArguments(context: InclusionContext, interaction: NodeInteractionCalled): void {
		this.variable!.includeCallArguments(context, interaction);
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

	applyDeoptimizations() {
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
		if (this.isVariableReference) {
			this.variable!.addUsedPlace(this);
			this.scope.context.requestTreeshakingPass();
		}
	}

	private disallowImportReassignment(): never {
		return this.scope.context.error(
			logIllegalImportReassignment(this.name, this.scope.context.module.id),
			this.start
		);
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
