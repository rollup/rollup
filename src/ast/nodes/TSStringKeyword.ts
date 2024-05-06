import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class TSStringKeyword extends NodeBase {
	declare type: NodeType.tTSStringKeyword;
}
