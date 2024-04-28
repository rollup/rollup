import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXIdentifier extends NodeBase {
	type!: NodeType.tJSXIdentifier;
	name!: string;
}
