import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import type TSTypeAnnotation from './TSTypeAnnotation';
import { NodeBase } from './shared/Node';

export default class TSPropertySignature extends NodeBase {
	declare type: NodeType.tTSPropertySignature;
	declare key: Identifier;
	declare typeAnnotation: TSTypeAnnotation | null;

	declare computed: boolean;
	declare optional: boolean;
	declare readonly: boolean;
	declare static: boolean;
}
