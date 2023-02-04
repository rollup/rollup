class SuperValues {
	get isTrue() {
		return true;
	}
	get prop() {
		return { isTrue: true };
	}
}
class Values extends SuperValues {}
if (Values.prototype.isTrue) console.log('retained');
else console.log('removed');

const prop = { isTrue: true };
class SuperDeopt {
	get prop() {
		return prop;
	}
}
class Deopt extends SuperDeopt {}
Deopt.prototype.prop.isTrue = false;
if (Deopt.prototype.prop.isTrue) console.log('unimportant');
else console.log('retained');
