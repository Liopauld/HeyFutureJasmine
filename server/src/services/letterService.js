export function canEditLetter(letter) {
  const lockWindowMs = 24 * 60 * 60 * 1000;
  const timeToDelivery = new Date(letter.deliveryDate) - Date.now();
  return timeToDelivery > lockWindowMs;
}
