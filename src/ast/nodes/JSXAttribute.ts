import type JSXIdentifier from './JSXIdentifier';
import type * as NodeType from './NodeType';
import type { ExpressionNode } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class JSXAttribute extends NodeBase {
	declare name: JSXIdentifier;
	declare value: ExpressionNode | null;
	declare type: NodeType.tJSXAttribute;
}
