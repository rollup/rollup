import { InclusionContext } from '../ExecutionContext';
import { NodeBase } from './shared/Node';

export default class UnknownNode extends NodeBase {
	hasEffects() {
		return true;
	}

	include(context: InclusionContext) {
		super.include(context, true);
	}
}
