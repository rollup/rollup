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
console.log('retained');
Values.prototype.effect();
Values.prototype.prop.effect();
