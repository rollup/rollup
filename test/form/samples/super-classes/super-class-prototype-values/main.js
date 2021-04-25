class SuperValues {
	isTrueProp = true;
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
if (Values.prototype.prop.isTrue) console.log('retained');
else console.log('removed');
// Note that isTrueProp is not part of the prototype
if (Values.prototype.isTrueProp) console.log('removed');
else console.log('retained');

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
