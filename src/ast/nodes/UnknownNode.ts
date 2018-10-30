import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { NodeBase } from './shared/Node';

export default class UnknownNode extends NodeBase {
	hasEffects(_options: ExecutionPathOptions) {
		return true;
	}

	include() {
		super.include(true);
	}
}
