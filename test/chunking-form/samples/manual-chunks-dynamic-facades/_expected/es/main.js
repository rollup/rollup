const DEP = 'DEP';

Promise.all([import('./generated-dynamic.js'), import('./generated-dynamic2.js'), import('./generated-dynamic3.js')]).then(
	results => console.log(results, DEP)
);

export { DEP as D };
