import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionBase } from './shared/Expression';

export default class UnknownNode extends ExpressionBase {
	hasEffects (_options: ExecutionPathOptions) {
		return true;
	}
}
