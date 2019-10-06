import { ExecutionContext } from '../ExecutionContext';
import { IncludeChildren, NodeBase } from './shared/Node';

export default class UnknownNode extends NodeBase {
	hasEffects() {
		return true;
	}

	include(_includeChildrenRecursively: IncludeChildren, context: ExecutionContext) {
		super.include(true, context);
	}
}
