export const ANONYMOUS_PLUGIN_PREFIX = 'at position ';

export const deprecatedHooks: { active: boolean; deprecated: string; replacement: string }[] = [
	{ active: true, deprecated: 'ongenerate', replacement: 'generateBundle' },
	{ active: true, deprecated: 'onwrite', replacement: 'generateBundle/writeBundle' },
	{ active: true, deprecated: 'transformBundle', replacement: 'renderChunk' },
	{ active: true, deprecated: 'transformChunk', replacement: 'renderChunk' },
	{ active: false, deprecated: 'resolveAssetUrl', replacement: 'resolveFileUrl' }
];
