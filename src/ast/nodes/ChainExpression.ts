import type CallExpression from './CallExpression';
import type MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ChainExpression extends NodeBase {
	declare expression: CallExpression | MemberExpression;
	declare type: NodeType.tChainExpression;
}
