import { format, subDays } from "date-fns";

// Fixtures shared by the dev bar and the test suite, so the data loaded by hand while
// developing is the same data the tests assert on.

const USUAL_NAMES = [
  "Lucho",
  "Mura",
  "Mauro",
  "Lihue",
  "Eze",
  "Patru",
  "Mati",
  "Nacho",
  "Fede Camino",
  "Mati R",
  "Keis",
  "Max",
];

const numbered = (names: string[]) => names.map((name, index) => `${index + 1}. ${name}`).join("\n");

export const USUAL_LIST = numbered(USUAL_NAMES);

export const ODD_LIST = numbered(USUAL_NAMES.slice(0, 11));

export const DUPLICATE_NAMES_LIST = numbered([...USUAL_NAMES.slice(0, 11), "Mati"]);

// Fourteen signed up for twelve spots: the last two wait.
export const WAITLIST_LIST = numbered([...USUAL_NAMES, "Nico", "Juan"]);

export const USUAL_CAPACITY = 12;

export const USUAL_LOCATION = "Quintana y Salta";

export const USUAL_ORGANIZER = "Hernán";

// What the pitch costs on a Wednesday, so the picture shows a share per head while developing.
export const USUAL_PRICE = 24000;

// The store keeps whatever the datetime-local input produced, so fixtures use that same shape.
const DATE_TIME_LOCAL = "yyyy-MM-dd'T'HH:mm";

const WEDNESDAY = 3;

export function nextWednesdayAt(hour = 18, minute = 30, from: Date = new Date()): string {
  const date = new Date(from);

  date.setDate(date.getDate() + ((WEDNESDAY - date.getDay() + 7) % 7));
  date.setHours(hour, minute, 0, 0);

  // This week's match already kicked off: aim at the next one.
  if (date <= from) date.setDate(date.getDate() + 7);

  return format(date, DATE_TIME_LOCAL);
}

export function expiredDate(from: Date = new Date()): string {
  return format(subDays(from, 7), DATE_TIME_LOCAL);
}
