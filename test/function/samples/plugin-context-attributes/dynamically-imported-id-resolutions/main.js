import './data.js';

export const loadData = () => import('./data.js', { with: { type: 'custom' } });
