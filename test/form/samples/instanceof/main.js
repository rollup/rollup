class Unused1 {}
class Used1 {}
const Intermediate = Used1;

if (new Intermediate() instanceof Unused1) console.log('removed');
else console.log('retained');

class Unused2 {}
class WithEffect {
	constructor() {
		console.log('effect');
	}
}

if (new WithEffect() instanceof Unused2)
	console.log('does not matter, but effect should be retained');
else console.log('retained');
