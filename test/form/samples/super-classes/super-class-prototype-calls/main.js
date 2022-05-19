class SuperValues {
	get prop() {
		return {
			effect(used) {
				console.log('effect', used);
			},

		};
	}
	effect(used) {
		console.log('effect', used);
	}
	isTrue() {
		return true;
	}
}
class Values extends SuperValues {}
if (Values.prototype.isTrue()) console.log('retained');
else console.log('removed');
Values.prototype.effect();
Values.prototype.prop.effect();
