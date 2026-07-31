import { dataToEsm } from '@rollup/pluginutils';

export default function json(): any {
	return {
		name: 'json',
		transform: function transform(code: string, id: string, options: any) {
			if (id.slice(-5) !== '.json' && options?.rawId?.slice(-5) !== '.json') {
				return null;
			}

			try {
				const parsed = JSON.parse(code);
				return {
					code: dataToEsm(parsed, {
						indent: '\t'
					}),
					map: { mappings: '' }
				};
			} catch (error) {
				const message = 'Could not parse JSON file';
				this.error({ cause: error, id, message });
			}
		}
	};
}
