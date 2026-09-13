import { describe, expect, it } from "vitest";
import { nextKickoff, parseMessage } from "./message";

// A Sunday morning, so "miércoles" is three days ahead and nothing is ambiguous.
const NOW = new Date(2026, 8, 13, 11, 0);

// The three real messages the rule was written against, invisible characters included.
const WEDNESDAY_MESSAGE = [
  "Partido de los miercoles ",
  "",
  "⏳Miércoles 18.30hrs",
  "🏟️ Cancha: Quintana y Salta",
  "",
  "⬇️ Esta semana:",
  "",
  "1. Lucho",
  "2. Mura",
  "3. Mauro",
  "4. Lihue",
  "5. Eze ",
  "6. Patru",
  "7. Mati",
  "8. Nacho",
  "9. Fede Camino",
  "10. Mati R",
  "11. Keis",
  "12.  Max",
].join("\n");

const FAREWELL_MESSAGE =
  "PARTIDO DESPEDIDA DE MESSI\n\n1.⁠ ⁠Oveja\n2.⁠ ⁠Gonzalo\n3.⁠ ⁠Eze\n4.⁠ ⁠Mati\n5.⁠ ⁠⁠Igna\n 6.⁠ ⁠Keis\n 7.⁠ ⁠Sera\n 8.⁠ ⁠Ale\n 9.⁠ ⁠El Diablo\n10.⁠ ⁠Jorge\n";

const BARE_MESSAGE =
  " 1.⁠ ⁠Sera\n 2.⁠ ⁠Mauro\n 3.⁠ ⁠Andres(el titan)\n 4.⁠ ⁠⁠Igna\n 5.⁠ ⁠Nata\n 6.⁠ ⁠Mati\n 7.⁠ ⁠@le\n 8.⁠ ⁠Oveja\n 9.⁠ ⁠Gonzalo\n10.⁠ ⁠Jorge\n";

describe("parseMessage", () => {
  it("keeps only the numbered lines as players: twelve, not sixteen", () => {
    const { players } = parseMessage(WEDNESDAY_MESSAGE, NOW);

    expect(players).toHaveLength(12);
    expect(players[0]).toBe("1. Lucho");
    expect(players[11]).toBe("12.  Max");
  });

  it("reads the pitch off the line that names it", () => {
    expect(parseMessage(WEDNESDAY_MESSAGE, NOW).location).toBe("Quintana y Salta");
  });

  it("reads the day and the time as the coming kickoff", () => {
    expect(parseMessage(WEDNESDAY_MESSAGE, NOW).date).toBe("2026-09-16T18:30");
  });

  it("does not take 'Partido de los miércoles' for a date", () => {
    expect(parseMessage("Partido de los miercoles\n1. Lucho\n2. Mura", NOW).date).toBeUndefined();
  });

  it("removes the invisible characters WhatsApp puts after the numbers", () => {
    const { players } = parseMessage(FAREWELL_MESSAGE, NOW);

    expect(players).toHaveLength(10);
    expect(players.some((line) => line.includes("⁠"))).toBe(false);
    expect(players[5]).toBe("6. Keis");
  });

  it("leaves the title out and finds neither a pitch nor a date when the message has none", () => {
    const parsed = parseMessage(FAREWELL_MESSAGE, NOW);

    expect(parsed.location).toBeUndefined();
    expect(parsed.date).toBeUndefined();
  });

  it("handles a message that is only the numbered list", () => {
    expect(parseMessage(BARE_MESSAGE, NOW).players).toHaveLength(10);
  });

  it("falls back to one name per line when nothing is numbered", () => {
    expect(parseMessage("Lucho\nMura\n\nMauro", NOW).players).toEqual(["Lucho", "Mura", "Mauro"]);
  });

  it("accepts the other ways people number a list", () => {
    expect(parseMessage("1) Lucho\n2- Mura\n3: Mauro\n4 Lihue", NOW).players).toHaveLength(4);
  });

  it("reads '20hs' as twenty o'clock and 'Lugar' as the pitch", () => {
    const parsed = parseMessage("Martes 20hs\nLugar: Club Comunicaciones\n1. Lucho\n2. Mura", NOW);

    expect(parsed.date).toBe("2026-09-15T20:00");
    expect(parsed.location).toBe("Club Comunicaciones");
  });
});

describe("nextKickoff", () => {
  it("aims at the coming occurrence of the day", () => {
    expect(nextKickoff(3, 18, 30, NOW)).toBe("2026-09-16T18:30");
  });

  it("keeps today when the hour is still ahead", () => {
    expect(nextKickoff(0, 20, 0, NOW)).toBe("2026-09-13T20:00");
  });

  it("jumps a week when today's hour has passed", () => {
    expect(nextKickoff(0, 9, 0, NOW)).toBe("2026-09-20T09:00");
  });
});
