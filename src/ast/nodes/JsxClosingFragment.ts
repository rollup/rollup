import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JsxClosingFragment extends NodeBase {
	declare type: NodeType.tJsxElement;
}
