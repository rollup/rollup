import { error, getRollupError, logModuleParseError, logParseError } from '../../utils/logs';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class PanicError extends NodeBase {
	declare type: NodeType.tPanicError;
	declare message: string;

	initialise() {
		const id = this.scope.context.module.id;
		// This simulates the current nested error structure. We could also just
		// replace it with a flat error.
		const parseError = getRollupError(logParseError(this.message));
		const moduleParseError = logModuleParseError(parseError, id);
		return error(moduleParseError);
	}
}
