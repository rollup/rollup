import { config } from './config';
import asap from './asap';
import defer from './defer';

config.async = asap;

export { defer };
