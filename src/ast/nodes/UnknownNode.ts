import ExecutionPathOptions from '../ExecutionPathOptions';
import { BasicExpressionNode } from './shared/Expression';

export default class UnknownNode extends BasicExpressionNode {
	hasEffects (_options: ExecutionPathOptions) {
		return true;
	}
}
