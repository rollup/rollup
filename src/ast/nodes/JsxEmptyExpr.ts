import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JsxEmptyExpr extends NodeBase {
	type!: NodeType.tJsxEmptyExpr;
}
