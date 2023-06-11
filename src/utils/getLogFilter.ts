import type { RollupLog } from '../rollup/types';
import type { GetLogFilter } from './getLogFilterType';

export const getLogFilter: GetLogFilter = filters => {
	if (filters.length === 0) return () => true;
	const normalizedFilters: [string, string[]][] = filters.map(filter => {
		const [key, ...value] = filter.split(':');
		return [key, value.join(':').split('*')];
	});
	return (log: RollupLog): boolean => {
		tryFilters: for (const [key, parts] of normalizedFilters) {
			if (!(key in log)) {
				continue;
			}
			let value = String(log[key as keyof RollupLog]);
			if (!value.startsWith(parts[0])) {
				continue;
			}
			for (let index = 1; index < parts.length - 1; index++) {
				const part = parts[index];
				const position = value.indexOf(part);
				if (position === -1) {
					continue tryFilters;
				}
				value = value.slice(position + part.length);
			}
			if (!value.endsWith(parts[parts.length - 1])) {
				continue;
			}
			return true;
		}
		return false;
	};
};
