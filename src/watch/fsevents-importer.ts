let fsEvents: unknown;
let fsEventsImportError: Error | undefined;

const mod = 'fsevents';

export function loadFsEvents(): Promise<void> {
	return import(mod)
		.then(namespace => {
			fsEvents = namespace.default;
		})
		.catch(err => {
			fsEventsImportError = err;
		});
}

// A call to this function will be injected into the chokidar code
export function getFsEvents(): unknown {
	if (fsEventsImportError) throw fsEventsImportError;
	return fsEvents;
}
