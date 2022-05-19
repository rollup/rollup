class SuperValues {
	get prop() {
		return {
			effect(used) {
				console.log('effect', used);
			},
			isTrue() {
				return true;
			}
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
console.log('retained');
Values.prototype.effect();
Values.prototype.prop.effect();
