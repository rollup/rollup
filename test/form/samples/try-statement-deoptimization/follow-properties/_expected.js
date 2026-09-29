const helpers = {
	fails: exec => {
		try {
			exec();
			return false;
		} catch {
			return true;
		}
	}
};

const detection = helpers.fails(() => {
	Object.getPrototypeOf(null);
});
console.log(detection);
