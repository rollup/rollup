import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteractionAssigned } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, UnknownKey } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import { type ExpressionEntity } from './shared/Expression';
import type { IncludeChildren } from './shared/Node';
import { NodeBase, onlyIncludeSelf } from './shared/Node';
import type { DeclarationPatternNode, PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class RestElement extends NodeBase implements DeclarationPatternNode {
	declare argument: PatternNode;
	declare type: NodeType.tRestElement;
	private declarationInit: ExpressionEntity | null = null;

	addExportedVariables(
		variables: readonly Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		this.argument.addExportedVariables(variables, exportNamesByVariable);
	}

	declare(
		kind: VariableKind,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): LocalVariable[] {
		this.declarationInit = init;
		return (this.argument as DeclarationPatternNode).declare(
			kind,
			getIncludedPatternPath(destructuredInitPath),
			init
		);
	}

	deoptimizeAssignment(destructuredInitPath: ObjectPath, init: ExpressionEntity): void {
		this.argument.deoptimizeAssignment(getIncludedPatternPath(destructuredInitPath), init);
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0) {
			this.argument.deoptimizePath(EMPTY_PATH);
		}
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteractionAssigned,
		context: HasEffectsContext
	): boolean {
		return (
			path.length > 0 ||
			this.argument.hasEffectsOnInteractionAtPath(EMPTY_PATH, interaction, context)
		);
	}

	hasEffectsWhenDestructuring(
		context: HasEffectsContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		return this.argument.hasEffectsWhenDestructuring(
			context,
			getIncludedPatternPath(destructuredInitPath),
			init
		);
	}

	includeDestructuredIfNecessary(
		context: InclusionContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		return (this.included =
			this.argument.includeDestructuredIfNecessary(
				context,
				getIncludedPatternPath(destructuredInitPath),
				init
			) || this.included);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.included) this.includeNode(context);
		// This should just include the identifier, its properties should be
		// included where the variable is used.
		this.argument.include(context, includeChildrenRecursively);
	}

	markDeclarationReached(): void {
		(this.argument as DeclarationPatternNode).markDeclarationReached();
	}

	applyDeoptimizations() {
		this.deoptimized = true;
		if (this.declarationInit !== null) {
			this.declarationInit.deoptimizePath([UnknownKey, UnknownKey]);
			this.scope.context.requestTreeshakingPass();
		}
	}
}

RestElement.prototype.includeNode = onlyIncludeSelf;

const getIncludedPatternPath = (destructuredInitPath: ObjectPath): ObjectPath =>
	destructuredInitPath.at(-1) === UnknownKey
		? destructuredInitPath
		: [...destructuredInitPath, UnknownKey];
