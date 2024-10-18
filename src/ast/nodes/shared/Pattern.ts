import type { WritableEntity } from '../../Entity';
import type { ObjectPath } from '../../utils/PathTracker';
import type LocalVariable from '../../variables/LocalVariable';
import type { ExpressionEntity } from './Expression';
import type { Node } from './Node';
import type { VariableKind } from './VariableKinds';

export interface PatternNode extends WritableEntity, Node {
	declare(
		kind: VariableKind,
		includedInitPath: ObjectPath,
		init: ExpressionEntity
	): LocalVariable[];
	markDeclarationReached(): void;
}
