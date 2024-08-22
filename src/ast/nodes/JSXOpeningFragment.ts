import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXOpeningFragment extends NodeBase {
	type!: NodeType.tJSXOpeningElement;
	attributes!: never[];
	selfClosing!: false;
}
