import type { UserConfig } from 'vitepress';

export const transposeTables: NonNullable<
	NonNullable<UserConfig<any>['markdown']>['config']
> = md => {
	const render = md.renderer.render.bind(md.renderer);
	md.renderer.render = (tokens, options, environment) => {
		const filteredTokens: typeof tokens = [];
		let inEmptyThead = false;
		let inTransposedTable = false;
		let inFirstTableRowElement = false;
		for (const [index, token] of tokens.entries()) {
			const { type } = token;
			if (inEmptyThead) {
				if (type === 'thead_close') {
					inEmptyThead = false;
				}
				continue;
			}
			if (type === 'thead_open' && tokens[index + 3].content === '') {
				inEmptyThead = true;
				inTransposedTable = true;
				continue;
			}
			if (inTransposedTable) {
				if (type === 'tr_open') {
					inFirstTableRowElement = true;
					token.attrPush(['class', 'transposed-table']);
				}
				if (inFirstTableRowElement) {
					if (type === 'td_open') {
						token.type = 'th_open';
						token.tag = 'th';
					} else if (type === 'td_close') {
						token.type = 'th_close';
						token.tag = 'th';
						inFirstTableRowElement = false;
					}
				}
				if (type === 'table_close') {
					inTransposedTable = false;
				}
			}
			filteredTokens.push(token);
		}
		return render(filteredTokens, options, environment);
	};
};
