import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ParseError extends NodeBase {
	declare type: NodeType.tParseError;
}
