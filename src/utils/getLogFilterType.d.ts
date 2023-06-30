import type { RollupLog } from '../rollup/types';

export type GetLogFilter = typeof getLogFilter;

export function getLogFilter(filters: string[]): (log: RollupLog) => boolean;
