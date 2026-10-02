import { OTHER } from './other.js';
import './x.js';

globalThis.mACount = (globalThis.mACount || 0) + 1;

export const MA = OTHER + '-mA';
