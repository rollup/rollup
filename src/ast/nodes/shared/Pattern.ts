import type { WritableEntity } from '../../Entity';
import type LocalVariable from '../../variables/LocalVariable';
import type { ExpressionEntity } from './Expression';
import type { Node } from './Node';

export interface PatternNode extends WritableEntity, Node {
	declare(kind: string, init: ExpressionEntity): LocalVariable[];
	markDeclarationReached(): void;
}
