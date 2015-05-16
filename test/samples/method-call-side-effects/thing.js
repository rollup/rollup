export default {
	mutate: function ( object ) {
		object.mutated = true;
		this.methodWasCalled = true;
	},

	methodWasCalled: false
};