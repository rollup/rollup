import { ExpressionEntity } from './nodes/shared/Expression';
import SpreadElement from './nodes/SpreadElement';

export interface CallCreateOptions {
	args?: (ExpressionEntity | SpreadElement)[];
	callIdentifier: Object;
	withNew: boolean;
}

export default class CallOptions implements CallCreateOptions {
	static create(callOptions: CallCreateOptions) {
		return new this(callOptions);
	}

	args: (ExpressionEntity | SpreadElement)[];
	callIdentifier: Object;
	withNew: boolean;

	constructor(
		{ withNew = false, args = [], callIdentifier = undefined as any }: CallCreateOptions = {} as any
	) {
		this.withNew = withNew;
		this.args = args;
		this.callIdentifier = callIdentifier;
	}

	equals(callOptions: CallOptions) {
		return callOptions && this.callIdentifier === callOptions.callIdentifier;
	}
}
