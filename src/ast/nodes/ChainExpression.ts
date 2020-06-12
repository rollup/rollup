import CallExpression from './CallExpression';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ChainExpression extends NodeBase {
	expression!: CallExpression | MemberExpression;
	type!: NodeType.tChainExpression;
}
