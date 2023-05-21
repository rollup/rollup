import process from 'node:process';
import type { HookAction, PluginDriver } from './PluginDriver';

function formatAction([pluginName, hookName, parameters]: HookAction): string {
	const action = `(${pluginName}) ${hookName}`;
	const s = JSON.stringify;
	switch (hookName) {
		case 'resolveId': {
			return `${action} ${s(parameters[0])} ${s(parameters[1])}`;
		}
		case 'load': {
			return `${action} ${s(parameters[0])}`;
		}
		case 'transform': {
			return `${action} ${s(parameters[1])}`;
		}
		case 'shouldTransformCachedModule': {
			return `${action} ${s((parameters[0] as { id: string }).id)}`;
		}
		case 'moduleParsed': {
			return `${action} ${s((parameters[0] as { id: string }).id)}`;
		}
	}
	return action;
}

let handleBeforeExit: null | (() => void) = null;
const rejectByPluginDriver = new Map<PluginDriver, (reason: Error) => void>();

export async function catchUnfinishedHookActions<T>(
	pluginDriver: PluginDriver,
	callback: () => Promise<T>
): Promise<T> {
	const emptyEventLoopPromise = new Promise<T>((_, reject) => {
		rejectByPluginDriver.set(pluginDriver, reject);
		if (!handleBeforeExit) {
			// We only ever create a single event listener to avoid max listener and
			// other issues
			handleBeforeExit = () => {
				for (const [pluginDriver, reject] of rejectByPluginDriver) {
					const unfulfilledActions = pluginDriver.getUnfulfilledHookActions();
					reject(
						new Error(
							`Unexpected early exit. This happens when Promises returned by plugins cannot resolve. Unfinished hook action(s) on exit:\n` +
								[...unfulfilledActions].map(formatAction).join('\n')
						)
					);
				}
			};
			process.once('beforeExit', handleBeforeExit);
		}
	});

	try {
		return await Promise.race([callback(), emptyEventLoopPromise]);
	} finally {
		rejectByPluginDriver.delete(pluginDriver);
		if (rejectByPluginDriver.size === 0) {
			process.off('beforeExit', handleBeforeExit!);
			handleBeforeExit = null;
		}
	}
}
