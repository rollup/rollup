import process from 'process';

const unfulfilledActions = new Set<[string, string, Parameters<any>]>();

export function addUnresolvedAction(actionTuple: [string, string, Parameters<any>]): void {
	unfulfilledActions.add(actionTuple);
}

export function resolveAction(actionTuple: [string, string, Parameters<any>]): void {
	unfulfilledActions.delete(actionTuple);
}

function formatAction([pluginName, hookName, args]: [string, string, Parameters<any>]): string {
	const action = `(${pluginName}) ${hookName}`;
	const s = JSON.stringify;
	switch (hookName) {
		case 'resolveId':
			return `${action} ${s(args[0])} ${s(args[1])}`;
		case 'load':
			return `${action} ${s(args[0])}`;
		case 'transform':
			return `${action} ${s(args[1])}`;
		case 'shouldTransformCachedModule':
			return `${action} ${s((args[0] as { id: string }).id)}`;
		case 'moduleParsed':
			return `${action} ${s((args[0] as { id: string }).id)}`;
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
		process.exitCode = 1;
	}
});
