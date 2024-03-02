import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JsxText extends NodeBase {
	type!: NodeType.tJsxText;
	value!: string;
}
