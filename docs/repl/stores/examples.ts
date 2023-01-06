import type { Module } from './modules';

interface Example {
	id: string;
	modules: [Module & { isEntry: true; name: 'main.js' }, ...Module[]];
	title: string;
}

const examples: [Example, ...Example[]] = [
	{
		id: '00',
		modules: [
			{
				// language=JavaScript
				code: `/* DYNAMIC IMPORTS
\tRollup supports automatic chunking and lazy-loading
\tvia dynamic imports utilizing the import mechanism
\tof the host system. */
if (displayMath) {
\timport('./maths.js').then(maths => {
\t\tconsole.log(maths.square(5));
\t\tconsole.log(maths.cube(5));
\t});
}`,
				isEntry: true,
				name: 'main.js'
			},
			{
				// language=JavaScript
				code: `import square from './square.js';

export { default as square } from './square.js';

export const cube = x => square(x) * x;`,
				isEntry: false,
				name: 'maths.js'
			},
			{
				// language=JavaScript
				code: `export default x => x * x;`,
				isEntry: false,
				name: 'square.js'
			}
		],
		title: 'Dynamic imports'
	}
];

export const examplesById: Record<string, Example> = {};
for (const example of examples) {
	examplesById[example.id] = example;
}
