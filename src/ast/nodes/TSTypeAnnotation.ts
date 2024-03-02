import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';
import TSNumberKeyword from './TSNumberKeyword';

export default class TSTypeAnnotation extends NodeBase {
	declare type: NodeType.tTSTypeAnnotation;
	declare typeAnnotation: TSNumberKeyword | null;
}
