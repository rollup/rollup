let fsEvents: typeof import('fsevents');
let fsEventsImportError: Error | undefined;

export function loadFsEvents(): Promise<void> {
	return import('fsevents')
		.then(namespace => {
			fsEvents = namespace.default;
		})
		.catch(err => {
			fsEventsImportError = err;
		});
}

// A call to this function will be injected into the chokidar code
export function getFsEvents(): typeof import('fsevents') {
	if (fsEventsImportError) throw fsEventsImportError;
	return fsEvents;
}
