import type { WritableEntity } from '../../Entity';
import type LocalVariable from '../../variables/LocalVariable';
import type { ExpressionEntity } from './Expression';
import type { Node } from './Node';
import type { VariableKind } from './VariableKinds';

export interface PatternNode extends WritableEntity, Node {
	declare(kind: VariableKind, init: ExpressionEntity): LocalVariable[];
	markDeclarationReached(): void;
}
