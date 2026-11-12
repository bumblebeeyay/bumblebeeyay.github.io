/** Night falls at 21:00 and the sun is back at 6:00, on the visitor's clock. */
export function isNightAt(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 21 || hour < 6;
}
