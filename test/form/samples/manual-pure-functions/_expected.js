const lib = {
	a: () => {
		console.log();
		return () => {
			console.log();
			return () => {
				console.log();
				return console.log;
			}
		}
	}
};

lib(); // not removed
lib.b(); // not removed
