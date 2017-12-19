import BlockScope from '../scopes/BlockScope';
import Statement from './shared/Statement';

export default class SwitchStatement extends Statement {
	hasEffects (options) {
		return super.hasEffects(options.setIgnoreBreakStatements());
	}

	initialiseScope (parentScope) {
		this.scope = new BlockScope({ parent: parentScope });
	}
}
