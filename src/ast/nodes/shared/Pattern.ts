import { WritableEntity } from '../../Entity';
import Variable from '../../variables/Variable';
import { Node } from './Node';

export interface PatternNode extends WritableEntity, Node {
	addExportedVariables(variables: Variable[]): void;
}
