module.exports = defineTest({
	description: 'warns when input hooks are used in output plugins',
	options: {
		output: {
			plugins: [
				{
					name: 'test-plugin',
					options() {},
					buildStart() {},
					resolveId() {},
					load() {},
					transform() {},
					buildEnd() {},
					outputOptions() {},
					renderStart() {},
					banner() {},
					footer() {},
					intro() {},
					outro() {},
					resolveDynamicImport() {},
					resolveFileUrl() {},
					resolveImportMeta() {},
					augmentChunkHash() {},
					renderChunk() {},
					generateBundle() {},
					writeBundle() {},
					renderError() {}
				},
				{
					buildStart() {}
				}
			]
		}
	},
	warnings: [
		{
			code: 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
			message:
				'The "buildEnd" hook used by the output plugin test-plugin is a build time hook and will not be run for that plugin. Either this plugin cannot be used as an output plugin, or it should have an option to configure it as an output plugin.'
		},
		{
			code: 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
			message:
				'The "buildStart" hook used by the output plugin test-plugin is a build time hook and will not be run for that plugin. Either this plugin cannot be used as an output plugin, or it should have an option to configure it as an output plugin.'
		},
		{
			code: 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
			message:
				'The "load" hook used by the output plugin test-plugin is a build time hook and will not be run for that plugin. Either this plugin cannot be used as an output plugin, or it should have an option to configure it as an output plugin.'
		},
		{
			code: 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
			message:
				'The "options" hook used by the output plugin test-plugin is a build time hook and will not be run for that plugin. Either this plugin cannot be used as an output plugin, or it should have an option to configure it as an output plugin.'
		},
		{
			code: 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
			message:
				'The "resolveDynamicImport" hook used by the output plugin test-plugin is a build time hook and will not be run for that plugin. Either this plugin cannot be used as an output plugin, or it should have an option to configure it as an output plugin.'
		},
		{
			code: 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
			message:
				'The "resolveId" hook used by the output plugin test-plugin is a build time hook and will not be run for that plugin. Either this plugin cannot be used as an output plugin, or it should have an option to configure it as an output plugin.'
		},
		{
			code: 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
			message:
				'The "transform" hook used by the output plugin test-plugin is a build time hook and will not be run for that plugin. Either this plugin cannot be used as an output plugin, or it should have an option to configure it as an output plugin.'
		},
		{
			code: 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
			message:
				'The "buildStart" hook used by the output plugin at output position 2 is a build time hook and will not be run for that plugin. Either this plugin cannot be used as an output plugin, or it should have an option to configure it as an output plugin.'
		}
	]
});
