import Enumerator from './enumerator';
import Promise from './promise';

function AllSettled () {}

AllSettled.prototype = o_create(Enumerator.prototype);
AllSettled.prototype._superConstructor = Enumerator;

export default function allSettled(entries, label) {
  return new AllSettled();
}
