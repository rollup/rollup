import { lib } from './lib';
export const dynamic = () => import('./dynamic').then(({ dynamic }) => dynamic + lib);
export { other } from './other';
export { external } from 'external';
