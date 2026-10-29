import moment from 'moment';

export function fromNow(date) {
  if (!date) return '';
  return moment(date).fromNow();
}

export function prettyDate(date) {
  if (!date) return '';
  return moment(date).format('MMM D, YYYY');
}

export function priorityLabel(p) {
  if (p == 3) return 'High';
  if (p == 2) return 'Normal';
  if (p == 1) return 'Low';
  return '?';
}
