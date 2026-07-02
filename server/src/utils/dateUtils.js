export function isFutureDate(date) {
  return new Date(date).getTime() > Date.now();
}
