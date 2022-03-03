export function printQuotedStringList(
	list: readonly string[],
	verbs?: readonly [string, string]
): string {
	const isSingleItem = list.length <= 1;
	const quotedList = list.map(item => `"${item}"`);
	let output = isSingleItem
		? quotedList[0]
		: `${quotedList.slice(0, -1).join(', ')} and ${quotedList.slice(-1)[0]}`;
	if (verbs) {
		output += ` ${isSingleItem ? verbs[0] : verbs[1]}`;
	}
	return output;
}
