const objRetained = {
	set value(v) {},
	set [globalThis.unknown](v) {
		console.log('effect');
	}
};

objRetained.value = 'retained';
