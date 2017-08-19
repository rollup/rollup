const deprecated = {
	entry: 'input',
	dest: 'output',
	moduleName: 'name',
	sourceMap: 'sourcemap',
	sourceMapFile: 'sourcemapFile',
	useStrict: 'strict'
};

export default function checkDeprecatedOptions ( options ) {
	if ( !options ) return;

	const changedOptions = [];
	Object.keys( deprecated ).forEach( key => {
		if ( key in options ) {
			changedOptions.push({ key, replacement: deprecated[ key ] });
			options[ deprecated[ key ] ] = options[ key ];
			delete options[ key ];
		}
	});

	if ( options.targets ) {
		let deprecatedTargetDest = false;
		options.targets.forEach( target => {
			if ( 'dest' in target ) {
				target.output = target.dest;
				delete target.dest;
				if ( !deprecatedTargetDest ) {
					changedOptions.push({ key: 'target.dest', replacement: 'target.output' });
					deprecatedTargetDest = true;
				}
			}
		});
	}

	if ( changedOptions.length ) {
		const message = `The following options have been renamed — please update your config: ${changedOptions.map(({ key, replacement }) => `${key} -> ${replacement}`).join(', ')}`;
		if ( options.onwarn ) {
			options.onwarn({
				code: 'DEPRECATED_OPTIONS',
				message,
				options: changedOptions
			});
		} else {
			console.warn( message ); // eslint-disable-line no-console
		}
	}
}