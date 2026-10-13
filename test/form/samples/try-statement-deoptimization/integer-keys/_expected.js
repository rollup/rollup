const helpers = {
	0: exec => {
		try {
			exec();
			return false;
		} catch {
			return true;
		}
	}
};

const detection = helpers[0](() => {
	Object.getPrototypeOf(null);
});
console.log(detection);

const unknownDetection = helpers[1](() => {
});
console.log(unknownDetection);
