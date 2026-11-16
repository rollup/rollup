export let count = 0;
export function reset(values) {
	[count] = values;
}
reset([1]);

export let top = 0;
[top] = [9];

export let name = '';
({ name } = { name: 'ok' });

export let fromExpr = 0;
void ([fromExpr] = [4]);

export let seq = 0;
null, [seq] = [5];

export let paired = 0;
export { paired as pairedAlias };
[paired] = [7];
