export const test = () => {
	console.log(foo());
	console.log(bar());
};

const foo = () => {
	return BUILD ? A : B;
};

const bar = () => {
	return getBuild() ? A : B;
};

const getBuild = () => BUILD;

const BUILD = true;
