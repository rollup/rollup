import type { RollupReplaceOptions } from '@rollup/plugin-replace';

export function getEnvironmentReplacement(isBrowserBuild: boolean): RollupReplaceOptions {
	return {
		delimiters: ['', ''],
		include: ['src/Graph.ts'],
		preventAssignment: true,
		values: {
			'process.env.IS_BROWSER_BUILD': JSON.stringify(isBrowserBuild)
		}
	};
}
