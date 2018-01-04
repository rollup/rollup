import { WritableEntity } from '../../Entity';
import { Node } from './Node';

export interface Pattern extends WritableEntity {}

export interface PatternNode extends Pattern, Node {}
