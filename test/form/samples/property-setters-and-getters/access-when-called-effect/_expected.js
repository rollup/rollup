const called1 = {
	get value() {
		console.log('retained');
		return function() {};
	}
};

called1.value();

const instantiated1 = {
	get value() {
		console.log('retained');
		return class {};
	}
};

new instantiated1.value();

const called2 = {
	get value() {
		return function() {
			console.log('retained');
		};
	}
};

called2.value();

const instantiated2 = {
	get value() {
		return class {
			constructor() {
				console.log('retained');
			}
		};
	}
};

new instantiated2.value();
