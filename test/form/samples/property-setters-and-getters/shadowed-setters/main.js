const objRemoved = {
	set value(v) {
		console.log('shadowed');
	},
	set value(v) {}
};

objRemoved.value = 'removed';

const objRetained = {
	set value(v) {},
	set [globalThis.unknown](v) {
		console.log('effect');
	}
};

objRetained.value = 'retained';
