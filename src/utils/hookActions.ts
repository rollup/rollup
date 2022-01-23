const unfulfilledActions: Set<[string, string, Parameters<any>]> = new Set();

export function addUnresolvedAction(actionTuple: [string, string, Parameters<any>]): void {
	unfulfilledActions.add(actionTuple);
}

export function resolveAction(actionTuple: [string, string, Parameters<any>]): void {
	unfulfilledActions.delete(actionTuple);
}

function formatAction([pluginName, hookName, args]: [string, string, Parameters<any>]): string {
	let action = `(${pluginName}) ${hookName}`;
	const s = JSON.stringify;
	switch (hookName) {
		case 'resolveId':
			action += ` ${s(args[0])} ${s(args[1])}`;
			break;
		case 'load':
			action += ` ${s(args[0])}`;
			break;
		case 'transform':
			action += ` ${s(args[1])}`;
			break;
	}
	return action;
}

process.on('exit', () => {
	if (unfulfilledActions.size) {
		let err = '[!] Error: unfinished hook action(s) on exit:\n';
		for (const action of unfulfilledActions) {
			err += formatAction(action) + '\n';
		}
		console.error('%s', err);
		process.exit(1);
	}
});
