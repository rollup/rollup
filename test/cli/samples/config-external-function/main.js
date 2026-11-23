import { execute } from './_config.js' with { type: 'external' };
import { ok } from 'assert';
import { method } from 'external-module';

ok( execute );
method();
