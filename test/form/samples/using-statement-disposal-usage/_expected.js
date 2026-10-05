function syncOnly() {
	const resource = {
		[Symbol.dispose]() { console.log('sync'); }};
	const alias = resource;
	using captured = alias;
}
syncOnly();

async function asyncOnly() {
	const resource = {
		[Symbol.asyncDispose]() { console.log('async'); }
	};
	const alias = resource;
	await using captured = alias;
}
asyncOnly();

async function syncThenAsync() {
	const resource = {
		[Symbol.dispose]() { console.log('sync first'); },
		[Symbol.asyncDispose]() { console.log('async second'); }
	};
	const alias = resource;
	{ using captured = resource; }
	{ await using captured = alias; }
}
syncThenAsync();

async function asyncThenSync() {
	const resource = {
		[Symbol.dispose]() { console.log('sync second'); },
		[Symbol.asyncDispose]() { console.log('async first'); }
	};
	const alias = resource;
	{ await using captured = alias; }
	{ using captured = resource; }
}
asyncThenSync();

async function explicitSyncCall() {
	const resource = {
		[Symbol.dispose]() { console.log('explicit sync'); },
		[Symbol.asyncDispose]() { console.log('implicit async'); }
	};
	const alias = resource;
	await using captured = alias;
	resource[Symbol.dispose]();
}
explicitSyncCall();

function explicitAsyncCall() {
	const resource = {
		[Symbol.dispose]() { console.log('implicit sync'); },
		[Symbol.asyncDispose]() { console.log('explicit async'); }
	};
	const alias = resource;
	using captured = alias;
	resource[Symbol.asyncDispose]();
}
explicitAsyncCall();

async function nestedMember() {
	const resources = {
		nested: {
			resource: {
				[Symbol.asyncDispose]() { console.log('nested async'); }
			}
		}
	};
	await using captured = resources.nested.resource;
}
nestedMember();

async function destructuredAlias() {
	const resources = {
		resource: {
			[Symbol.asyncDispose]() { console.log('destructured async'); }
		}
	};
	const { resource: alias } = resources;
	await using captured = alias;
}
destructuredAlias();

async function assignedAsyncFunction() {
	function disposeAsync() { console.log('assigned async'); }
	const disposer = disposeAsync;
	const resource = {
		[Symbol.asyncDispose]: disposer
	};
	await using captured = resource;
}
assignedAsyncFunction();

async function assignedReceiverReader() {
	function disposeAsync() { console.log(this.label); }
	const disposer = disposeAsync;
	const resource = {
		label: 'receiver label',
		unused: 'retained with receiver',
		[Symbol.dispose]() { console.log('retained sync'); },
		[Symbol.asyncDispose]: disposer
	};
	await using captured = resource;
}
assignedReceiverReader();

async function lexicalArrowDisposer() {
	const disposer = () => console.log(this.label);
	const resource = {
		[Symbol.asyncDispose]: disposer
	};
	await using captured = resource;
}
lexicalArrowDisposer.call({ label: 'outer label' });
