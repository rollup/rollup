import { WritableEntity } from '../../Entity';
import LocalVariable from '../../variables/LocalVariable';
import { ExpressionEntity } from './Expression';
import { Node } from './Node';

export interface PatternNode extends WritableEntity, Node {
	declare(kind: string, init: ExpressionEntity | null): LocalVariable[];
}
