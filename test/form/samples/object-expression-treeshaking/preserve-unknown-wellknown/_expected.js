const obj1 = {
	[Symbol.wellKnownThatMightHaveBeenIntroducedInNewerVersionsOfECMAScript]: true,
	z: 1,
};
console.log(obj1.z);
