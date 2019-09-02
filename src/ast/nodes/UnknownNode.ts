import { ExecutionContext } from '../ExecutionContext';
import { NodeBase } from './shared/Node';

export default class UnknownNode extends NodeBase {
	hasEffects(_context: ExecutionContext) {
		return true;
	}

	include() {
		super.include(true);
	}
}
