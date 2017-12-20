import TaggedTemplateExpression from "./nodes/TaggedTemplateExpression";
import CallExpression from "./nodes/CallExpression";
import Expression from './nodes/Expression';
import NewExpression from "./nodes/NewExpression";

interface callOptions {
	withNew: boolean,
	args: Expression[],
	caller: TaggedTemplateExpression | CallExpression | NewExpression | void
}

export default class CallOptions {
	withNew: boolean;
	args: Expression[];
	caller: TaggedTemplateExpression | CallExpression | NewExpression | void;

	static create (callOptions: callOptions) {
		return new this(callOptions);
	}

	constructor ({ withNew = false, args = [], caller = undefined } = {}) {
		this.withNew = withNew;
		this.args = args;
		this.caller = caller;
	}

	equals (callOptions: CallOptions) {
		return callOptions && this.caller === callOptions.caller;
	}
}
