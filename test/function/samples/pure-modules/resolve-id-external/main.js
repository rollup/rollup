import 'sideeffects-false-pureext-false';
import { value as unusedValue1 } from 'sideeffects-false-pureext-false-unused-import';
import { value as usedValue1 } from 'sideeffects-false-pureext-false-used-import';

import 'sideeffects-null-pureext-false';
import { value as unusedValue2 } from 'sideeffects-null-pureext-false-unused-import';
import { value as usedValue2 } from 'sideeffects-null-pureext-false-used-import';

import 'sideeffects-true-pureext-false';
import { value as unusedValue3 } from 'sideeffects-true-pureext-false-unused-import';
import { value as usedValue3 } from 'sideeffects-true-pureext-false-used-import';

import 'sideeffects-false-pureext-true';
import { value as unusedValue4 } from 'sideeffects-false-pureext-true-unused-import';
import { value as usedValue4 } from 'sideeffects-false-pureext-true-used-import';

import 'sideeffects-null-pureext-true';
import { value as unusedValue5 } from 'sideeffects-null-pureext-true-unused-import';
import { value as usedValue5 } from 'sideeffects-null-pureext-true-used-import';

import 'sideeffects-true-pureext-true';
import { value as unusedValue6 } from 'sideeffects-true-pureext-true-unused-import';
import { value as usedValue6 } from 'sideeffects-true-pureext-true-used-import';

export const values = [usedValue1, usedValue2, usedValue3, usedValue4, usedValue5, usedValue6];
