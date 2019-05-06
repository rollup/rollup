import 'sideeffects-false-pureint-false';
import { value as unusedValue1 } from 'sideeffects-false-pureint-false-unused-import';
import { value as usedValue1 } from 'sideeffects-false-pureint-false-used-import';

import 'sideeffects-null-pureint-false';
import { value as unusedValue2 } from 'sideeffects-null-pureint-false-unused-import';
import { value as usedValue2 } from 'sideeffects-null-pureint-false-used-import';

import 'sideeffects-true-pureint-false';
import { value as unusedValue3 } from 'sideeffects-true-pureint-false-unused-import';
import { value as usedValue3 } from 'sideeffects-true-pureint-false-used-import';

import 'sideeffects-false-pureint-true';
import { value as unusedValue4 } from 'sideeffects-false-pureint-true-unused-import';
import { value as usedValue4 } from 'sideeffects-false-pureint-true-used-import';

import 'sideeffects-null-pureint-true';
import { value as unusedValue5 } from 'sideeffects-null-pureint-true-unused-import';
import { value as usedValue5 } from 'sideeffects-null-pureint-true-used-import';

import 'sideeffects-true-pureint-true';
import { value as unusedValue6 } from 'sideeffects-true-pureint-true-unused-import';
import { value as usedValue6 } from 'sideeffects-true-pureint-true-used-import';

export const values = [usedValue1, usedValue2, usedValue3, usedValue4, usedValue5, usedValue6];
