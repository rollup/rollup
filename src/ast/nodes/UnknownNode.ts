import type { InclusionContext } from '../ExecutionContext';
import type { ObjectPath } from '../utils/PathTracker';
import { NodeBase } from './shared/Node';

export default class UnknownNode extends NodeBase {
	hasEffects(): boolean {
		return true;
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		super.includePath(path, context, true);
	}
}
