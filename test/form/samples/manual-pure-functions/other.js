export const lib = () => console.log();
lib.a = () => {
	console.log();
	const result = () => console.log();
	result.c = console.log;
	return result;
};
lib.a.b = () => console.log();
