import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class TSNullKeyword extends NodeBase {
	declare type: NodeType.tTSNullKeyword;
}
