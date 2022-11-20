export const lib = {
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
