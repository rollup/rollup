import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JsxOpeningFragment extends NodeBase {
	type!: NodeType.tJsxOpeningElement;
	selfClosing!: boolean;
}
