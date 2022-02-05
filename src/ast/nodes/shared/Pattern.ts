import { WritableEntity } from '../../Entity';
import type LocalVariable from '../../variables/LocalVariable';
import type { ExpressionEntity } from './Expression';
import { Node } from './Node';

export interface PatternNode extends WritableEntity, Node {
	declare(kind: string, init: ExpressionEntity | null): LocalVariable[];
	markDeclarationReached(): void;
}
