import type { WritableEntity } from '../../Entity';
import type { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import type { ObjectPath } from '../../utils/PathTracker';
import type LocalVariable from '../../variables/LocalVariable';
import type { ExpressionEntity } from './Expression';
import type { Node } from './Node';
import type { VariableKind } from './VariableKinds';

export interface PatternNode extends WritableEntity, Node {
	// This should deoptimize both the left-hand and right-hand side
	deoptimizeAssignment(destructuredInitPath: ObjectPath, init: ExpressionEntity): void;

	hasEffectsWhenDestructuring(
		context: HasEffectsContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean;

	includeDestructuredIfNecessary(
		context: InclusionContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean;
}

export interface DeclarationPatternNode extends PatternNode {
	declare(
		kind: VariableKind,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): LocalVariable[];

	markDeclarationReached(): void;
}
