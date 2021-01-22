function mutateThis () {
	this.x = 1;
}
mutateThis();

function mutateNestedThis () {
	const mutateNested = () => this.bar = 1;
	mutateNested();
}
mutateNestedThis();

function mutateThisConditionally () {
	if ( globalThis.condition ) {
		this.baz = 1;
	}
}
mutateThisConditionally();

function CallSelfWithoutNew () {
	this.quux = 1;
	if ( globalThis.condition ) {
		CallSelfWithoutNew();
	}
}
new CallSelfWithoutNew();
