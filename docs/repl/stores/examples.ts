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
				code: `// DYNAMIC IMPORTS
// Rollup supports automatic chunking and lazy-loading
// via dynamic imports utilizing the import mechanism
// of the host system.
import square from './square.js';

// Directly use some math
console.log(square(2))

// Dynamically import the rest
import('./maths.js').then(maths => {
\tconsole.log(maths.square(5));
\tconsole.log(maths.cube(5));
});`,
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
				code: `// Modules shared between the entry chunk and the
// dynamic chunk are merged into the entry chunk.
export default x => x * x;`,
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
