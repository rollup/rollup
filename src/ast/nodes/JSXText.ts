import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXText extends NodeBase {
	type!: NodeType.tJSXText;
	value!: string;
	raw!: string;
}
