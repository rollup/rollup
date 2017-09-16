function NoEffectsDeclaration () {
	this.foo = 1;

	const mutateNested = () => this.bar = 1;
	mutateNested();

	if ( globalCondition ) {
		this.baz = 1;
	}
}
const a = new NoEffectsDeclaration();

const NoEffectsExpression = function () {
	this.foo = 1;

	const mutateNested = () => this.bar = 1;
	mutateNested();

	if ( globalCondition ) {
		this.baz = 1;
	}
};
const b = new NoEffectsExpression();

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
	if ( globalCondition ) {
		this.baz = 1;
	}
}
mutateThisConditionally();

function CallSelfWithoutNew () {
	this.quux = 1;
	if ( globalCondition ) {
		CallSelfWithoutNew();
	}
}
const c = new CallSelfWithoutNew();
