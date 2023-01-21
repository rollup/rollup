declare module 'vitepress-plugin-mermaid' {
	export const withMermaid: (config: any) => any;
}

declare module 'examples.json' {
	import type { Example } from './types';
	const version: Record<string, Example>;
	export default version;
}
