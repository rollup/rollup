import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXEmptyExpression extends NodeBase {
	type!: NodeType.tJSXEmptyExpression;
}
