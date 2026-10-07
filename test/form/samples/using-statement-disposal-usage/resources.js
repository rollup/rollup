export const namespaceResource = {
	[Symbol.dispose]() { console.log('unused namespace sync'); },
	[Symbol.asyncDispose]() { console.log('namespace async'); }
};
