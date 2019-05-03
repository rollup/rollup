import 'pure-true-external-false';
import 'pure-true-external-true';
import 'pure-false-external-false';// included
import 'pure-false-external-true';// included
import {value as unusedValue1} from 'pure-true-external-false-unused-import';
import {value as usedValue1} from 'pure-true-external-false-used-import';// included
import {value as unusedValue2} from 'pure-true-external-true-unused-import';
import {value as usedValue2} from 'pure-true-external-true-used-import';// included
import {value as unusedValue3} from 'pure-false-external-false-unused-import';// included
import {value as usedValue3} from 'pure-false-external-false-used-import';// included
import {value as unusedValue4} from 'pure-false-external-true-unused-import';// included
import {value as usedValue4} from 'pure-false-external-true-used-import';// included

export const values = [usedValue1, usedValue2, usedValue3, usedValue4];
