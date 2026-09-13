import { useMatchStore } from "@/store";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowsRightLeftIcon } from "@heroicons/react/20/solid";

/*
  A heading, not a card. This used to be a bordered panel with a violet chip in it, which put a
  box around the least important thing on a screen whose whole job is showing the two teams.
*/
const InfoCard = () => {
  const { organizer, date, location, random } = useMatchStore();

  const when = date && `${format(date, "EEEE dd/MM", { locale: es })} · ${format(date, "p", { locale: es })} hs`;

  return (
    <div className="flex w-full items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold uppercase leading-none tracking-tight text-text">{location}</h1>

        {/* Two lines, so the pill beside them never squeezes the author onto a line of their own. */}
        {when && <p className="mt-1.5 text-sm text-text-muted first-letter:uppercase">{when}</p>}
        {organizer && <p className="text-sm text-text-subtle">Creado por {organizer}</p>}
      </div>

      {/*
        On the title's own line rather than under it. How the teams were split is a property of the
        match, so it sits beside the match, and an outline carries it without shouting like a fill.
      */}
      {random && (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-secondary-400 px-3 py-1.5 text-sm font-medium text-secondary-300">
          <ArrowsRightLeftIcon className="h-4 w-4" aria-hidden="true" />
          Sorteo al azar
        </span>
      )}
    </div>
  );
};

export default InfoCard;
