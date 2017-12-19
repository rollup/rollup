export default class CallOptions {
	static create ( callOptions ) {
		return new this( callOptions );
	}

	constructor ( { withNew = false, args = [], caller } = {} ) {
		this.withNew = withNew;
		this.args = args;
		this.caller = caller;
	}

	equals ( callOptions ) {
		return callOptions && this.caller === callOptions.caller;
	}
}
