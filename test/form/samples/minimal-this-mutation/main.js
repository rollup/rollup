const obj1 = {
	noMutation() {},
	prop: true
};
obj1.noMutation();
if (obj1.prop) console.log('retained');
else console.log('removed');

const obj2 = {
	noMutationEffect() {
		console.log('effect');
	},
	prop: true
};
obj2.noMutationEffect();
if (obj2.prop) console.log('retained');
else console.log('removed');

const obj3 = {
	mutateProp() {
		this.prop = false;
	},
	prop: true
};
obj3.mutateProp();
if (obj3.prop) console.log('unimportant');
else console.log('retained');

const obj4 = {
	mutateUnknownProp() {
		this[globalThis.unknown] = false;
	},
	prop: true
};
obj4.mutateUnknownProp();
if (obj4.prop) console.log('retained');
else console.log('retained');

const obj5 = {
	mutateNestedProp() {
		this.nested.prop = false;
	},
	nested: {
		prop: true
	}
};
obj5.mutateNestedProp();
if (obj5.nested.prop) console.log('unimportant');
else console.log('retained');

const obj6 = {
	prop: true
};
obj6.doesNotExist();
if (obj6.prop) console.log('retained');
else console.log('removed');
