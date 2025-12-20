const obj1 = {
	[Symbol.wellKnownThatMightHaveBeenIntroducedInNewerVersionsOfECMAScript]: true,
	zz: 1,
	z: 1,
};
console.log(obj1.z);
