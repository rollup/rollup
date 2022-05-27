console.log('retained');

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
