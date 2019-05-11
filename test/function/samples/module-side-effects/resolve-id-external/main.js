import 'sideeffects-false-usereffects-false';
import { value as unusedValue1 } from 'sideeffects-false-usereffects-false-unused-import';
import { value as usedValue1 } from 'sideeffects-false-usereffects-false-used-import';

import 'sideeffects-null-usereffects-false';
import { value as unusedValue2 } from 'sideeffects-null-usereffects-false-unused-import';
import { value as usedValue2 } from 'sideeffects-null-usereffects-false-used-import';

import 'sideeffects-true-usereffects-false';
import { value as unusedValue3 } from 'sideeffects-true-usereffects-false-unused-import';
import { value as usedValue3 } from 'sideeffects-true-usereffects-false-used-import';

import 'sideeffects-false-usereffects-true';
import { value as unusedValue4 } from 'sideeffects-false-usereffects-true-unused-import';
import { value as usedValue4 } from 'sideeffects-false-usereffects-true-used-import';

import 'sideeffects-null-usereffects-true';
import { value as unusedValue5 } from 'sideeffects-null-usereffects-true-unused-import';
import { value as usedValue5 } from 'sideeffects-null-usereffects-true-used-import';

import 'sideeffects-true-usereffects-true';
import { value as unusedValue6 } from 'sideeffects-true-usereffects-true-unused-import';
import { value as usedValue6 } from 'sideeffects-true-usereffects-true-used-import';

export const values = [usedValue1, usedValue2, usedValue3, usedValue4, usedValue5, usedValue6];
