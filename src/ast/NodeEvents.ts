export const EVENT_ACCESSED = 0;
export const EVENT_ASSIGNED = 1;
export const EVENT_CALLED = 2;
export type NodeEvent = typeof EVENT_ACCESSED | typeof EVENT_ASSIGNED | typeof EVENT_CALLED;
