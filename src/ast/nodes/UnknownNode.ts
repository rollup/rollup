import ExecutionPathOptions from '../ExecutionPathOptions';
import { GenericExpressionNode } from './shared/Expression';

export default class UnknownNode extends GenericExpressionNode {
	hasEffects (_options: ExecutionPathOptions) {
		return true;
	}
}
