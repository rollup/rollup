import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class TSNumberKeyword extends NodeBase {
	declare type: NodeType.tTSNumberKeyword;
}
