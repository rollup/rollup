import { setup } from './helpers.js';
import { describe } from './api.js';

describe(setup());

export const getNamespace = () => import('./api.js');
