import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class TSBooleanKeyword extends NodeBase {
	declare type: NodeType.tTSBooleanKeyword;
}
