import TaggedTemplateExpression from "./nodes/TaggedTemplateExpression";
import CallExpression from "./nodes/CallExpression";
import Expression from './nodes/Expression';
import NewExpression from "./nodes/NewExpression";
import Property from "./nodes/Property";

export interface CallCreateOptions {
	withNew: boolean;
	args?: Expression[];
	caller: TaggedTemplateExpression | CallExpression | NewExpression | Property | void;
}

export default class CallOptions {
	withNew: boolean;
	args: Expression[];
	caller: TaggedTemplateExpression | CallExpression | NewExpression | Property | void;

	static create (callOptions: CallCreateOptions) {
		return new this(callOptions);
	}

	constructor ({ withNew = false, args = [], caller = undefined }: CallCreateOptions = {} as any) {
		this.withNew = withNew;
		this.args = args;
		this.caller = caller;
	}

	equals (callOptions: CallOptions) {
		return callOptions && this.caller === callOptions.caller;
	}
}
