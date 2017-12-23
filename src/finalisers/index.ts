import amd from './amd';
import cjs from './cjs';
import es from './es';
import iife from './iife';
import umd from './umd';
import Bundle from '../Bundle';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/index';

export type Finaliser = (
	bundle: Bundle,
	magicString: MagicStringBundle,
	{ exportMode, getPath, indentString, intro, outro }: {
		exportMode: string;
		indentString: string;
		getPath: (name: string) => string;
		intro: string;
		outro: string
	},
	options: OutputOptions
) => MagicStringBundle;

export default { amd, cjs, es, iife, umd } as { [format: string]: Finaliser };