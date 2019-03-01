import CallExpression from './nodes/CallExpression';
import NewExpression from './nodes/NewExpression';
import Property from './nodes/Property';
import { ExpressionEntity } from './nodes/shared/Expression';
import SpreadElement from './nodes/SpreadElement';
import TaggedTemplateExpression from './nodes/TaggedTemplateExpression';

export type CallExpressionType =
	| TaggedTemplateExpression
	| CallExpression
	| NewExpression
	| Property;

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
		{ withNew = false, args = [], callIdentifier = undefined }: CallCreateOptions = {} as any
	) {
		this.withNew = withNew;
		this.args = args;
		this.callIdentifier = callIdentifier;
	}

	equals(callOptions: CallOptions) {
		return callOptions && this.callIdentifier === callOptions.callIdentifier;
	}
}
