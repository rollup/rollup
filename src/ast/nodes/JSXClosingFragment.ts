import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXClosingFragment extends NodeBase {
	declare type: NodeType.tJSXElement;
}
