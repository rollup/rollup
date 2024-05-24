import type { ExpressionNode } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class TSInterfaceHeritage extends NodeBase {
	declare expression: ExpressionNode;
}
