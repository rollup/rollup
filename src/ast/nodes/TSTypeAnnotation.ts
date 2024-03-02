import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class TSTypeAnnotation extends NodeBase {
	declare type: NodeType.tTSTypeAnnotation;
	declare typeAnnotation: NodeType.tTSNumberKeyword;
}
