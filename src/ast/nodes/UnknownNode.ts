import { ExecutionContext } from '../ExecutionContext';
import { IncludeChildren, NodeBase } from './shared/Node';

export default class UnknownNode extends NodeBase {
	hasEffects(_context: ExecutionContext) {
		return true;
	}

	include(_includeChildrenRecursively: IncludeChildren, context: ExecutionContext) {
		super.include(true, context);
	}
}
