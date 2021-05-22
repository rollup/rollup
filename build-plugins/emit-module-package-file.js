export default function emitModulePackageFile() {
	return {
		generateBundle() {
			this.emitFile({ fileName: 'package.json', source: `{"type":"module"}`, type: 'asset' });
		},
		name: 'emit-module-package-file'
	};
}
