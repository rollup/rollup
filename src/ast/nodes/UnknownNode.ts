import type { InclusionContext } from '../ExecutionContext';
import { NodeBase } from './shared/Node';

export default class UnknownNode extends NodeBase<any> {
	hasEffects(): boolean {
		return true;
	}

	include(context: InclusionContext): void {
		super.include(context, true);
	}
}
