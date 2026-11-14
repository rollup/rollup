export const load = () => import('pkg');
export const loadWithAttributes = () => import('pkg', { with: { type: 'json' } });
