import type { UserConfig } from 'vitepress';

export const markdownConfig: NonNullable<
	NonNullable<UserConfig<any>['markdown']>['config']
> = md => {
	const fence = md.renderer.rules.fence!.bind(md.renderer.rules);
	md.renderer.rules.fence = (tokens, index, options, environment, slf) => {
		const token = tokens[index];

		if (token.info.trim() === 'mermaid') {
			const content = token.content.trim();
			// mermaid.initialize({
			// 	securityLevel: 'loose',
			// 	startOnLoad: false
			// });
			// const result = mermaid.render('id', content);
			// console.log(result);
			return `<h1>Hello Mermaid!</h1><pre>${content}</pre>`;
		}

		return fence(tokens, index, options, environment, slf);
	};
};
