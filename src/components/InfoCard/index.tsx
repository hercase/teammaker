import { Card, Chip } from "@heroui/react";
import { useMatchStore } from "@/store";
import { formatKickoff } from "@/utils/date";
import { ArrowsRightLeftIcon, BanknotesIcon, CalendarDaysIcon, MapPinIcon, UserIcon } from "@heroicons/react/20/solid";
import usePlayers from "@/hooks/usePlayers";
import { countPlaying, formatMoney, pricePerPlayer } from "@/utils";

/*
  HeroUI's Card, not a div with our panel recipe on it. Card.Title and Card.Description already
  carry the type scale and the muted foreground, so the only thing left to say here is what the
  match is — which is the point of moving to the library.

  The draw is a Chip rather than a hand-rolled pill: it used to be a span with its own border,
  radius, padding and colour written out, and every one of those is a decision the library has
  already made consistently with the rest of the app.

  This is the one surface that carries the brand violet, banked into its top-left corner, and the
  only one: it is what says "this is the match" against two team panels drawn in the same grey.
  The migration to Card dropped the tint and the three read as one stack of equal boxes. At 28% it
  measured 1.24:1 against the team panels — by this app's own rule, invisible — so it sits at 40%:
  at 55% the muted line fell to 4.18:1 at the corner, and 40% is the step that keeps it over 4.5. A second tinted surface anywhere would stop this one meaning anything.

  The icons are the same 20/solid family as the rest of the app, all 16px so the three lines share
  one left edge, and hidden from the accessibility tree: each sits beside the text it stands for.
*/
const TINT =
  "radial-gradient(ellipse 80% 130% at 0% 0%, color-mix(in oklab, var(--color-primary-600) 40%, transparent), transparent 70%)";

const InfoCard = () => {
  const { organizer, date, location, random, price } = useMatchStore();
  const { players } = usePlayers();

  const when = formatKickoff(date);
  /*
    "La cancha sale X, son Y cada uno" is the message that always follows the teams in the group;
    here it is on the picture, and Y follows whoever is actually playing when the picture is taken.
  */
  const playing = countPlaying(players ?? []);
  const share = pricePerPlayer(price, playing);

  return (
    <Card className="w-full" style={{ backgroundImage: TINT }}>
      <Card.Header className="flex-row items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          {/*
            18px at 700, down from 24 at 600. Set in caps on a dark card, HeroUI's heading step read
            thin and enormous — more banner than title, and it dwarfed the two lines under it that
            carry the actual detail. Two steps down the scale and one weight up: smaller, and the
            emphasis comes from the weight instead of the size.
          */}
          <Card.Title className="flex items-center gap-2 text-lg font-bold uppercase leading-none tracking-tight">
            <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">{location}</span>
          </Card.Title>

          {/* Two lines, so the chip beside them never squeezes the author onto a line of their own.
              When is the second thing the group reads off the picture, after where, so it keeps
              the full foreground; who created it is the detail and stays muted. */}
          {when && (
            <Card.Description className="flex items-center gap-2 text-foreground">
              <CalendarDaysIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="first-letter:uppercase">{when}</span>
            </Card.Description>
          )}
          {share && price && (
            <Card.Description className="flex items-center gap-2 text-foreground">
              <BanknotesIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {formatMoney(share)} cada uno <span className="text-muted">({formatMoney(price)})</span>
              </span>
            </Card.Description>
          )}
          {organizer && (
            <Card.Description className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Creado por {organizer}</span>
            </Card.Description>
          )}
        </div>

        {/*
          On the title's own line rather than under it. How the teams were split is a property of
          the match, so it sits beside the match.

          The cyan is ours, applied by className: HeroUI's Chip has no cyan slot, and its neutral
          left the one piece of information on this card indistinguishable from the card. Cyan is
          already the app's "this is worth noticing" — it marks a substitute in the team list.
        */}
        {random && (
          <Chip
            className="shrink-0 border border-secondary-400/40 bg-secondary-400/10 text-secondary-300"
            variant="soft"
          >
            <ArrowsRightLeftIcon className="h-4 w-4" aria-hidden="true" />
            Sorteo al azar
          </Chip>
        )}
      </Card.Header>
    </Card>
  );
};

export default InfoCard;
