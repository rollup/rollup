import Statement from './shared/Statement.js';

export default class ReturnStatement extends Statement {
	shouldBeIncluded () {
		return true;
	}
}
