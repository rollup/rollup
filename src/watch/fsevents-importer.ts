let fsEvents: any;
let fsEventsImportError: any;

export function loadFsEvents() {
	return import('fsevents')
		.then(namespace => {
			fsEvents = namespace.default;
		})
		.catch(err => {
			fsEventsImportError = err;
		});
}

// A call to this function will be injected into the chokidar code
export function getFsEvents() {
	if (fsEventsImportError) throw fsEventsImportError;
	return fsEvents;
}
