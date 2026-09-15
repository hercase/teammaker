"use client";

import { FC } from "react";
import { ArrowsRightLeftIcon } from "@heroicons/react/20/solid";
import { Description, Label, Switch } from "@heroui/react";

interface ToggleSwitchProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

/*
  The whole row, not just the lever.

  It used to be a bare switch dropped inside a <label> the form drew around it, which is invalid —
  a labelled control inside another label — and React Aria noticed: it rendered the visual parts and
  suppressed its own input, leaving a switch with no role, no keyboard and no state.

  So the switch owns its label and its line of explanation, and the row is ordered with CSS: the
  words read first and the lever sits at the right thumb's edge.

  The nesting is not a matter of taste. Switch.Content *is* the clickable part — React Aria's
  SwitchButton — so the Control has to live inside it and the Description has to stay outside it.
  With the Control as a sibling, as it was, the lever was decoration: tapping the words toggled the
  switch and tapping the switch did nothing at all. The library says so in as many words:
  "Switch.Content — the clickable SwitchButton label wrapping the control + Label. Keep
  Description/FieldError as siblings of Switch.Content."

  The track is cyan whether it is on or off, and the state is the lightness: a darker turquoise
  off, a lighter one on, plus the thumb sliding across and the arrows appearing on it. Off used to
  be --default, the neutral grey, which said "this control is asleep" when what it actually means
  is "the order is the list's order" — a setting with two live values, not one value and an
  absence. The arrows are the same mark the match card puts on its "Sorteo al azar" chip: the
  preference, the action that makes it true (Mezclar equipos) and the claim on the shared picture
  are one idea, so they get one mark, and now one colour.

  Which two steps is measured, not chosen. Two things have to clear 3:1 at rest — the track
  against the card, or there is no visible control (the unset switch once measured 1.20:1), and the
  white thumb against the track, or there is nothing to say which side it is on. Across the whole
  cyan ramp exactly two steps satisfy both, so they are the two: secondary-600 off (3.87:1 against
  the card, 4.49:1 for the thumb) and secondary-500 on (5.53:1 and 3.15:1). Everything lighter
  loses the thumb — secondary-400, which this was, leaves it at 2.13:1 — and everything darker
  loses the track. It is a gentle step between the two; the thumb's position and the icon are what
  carry the state, and the colour agrees with them instead of being the only signal.

  Switch has a `size` and no colour, so the cyan comes through the tokens the library declares on
  `.switch` for exactly this, and not by painting over .switch__control, which would have to win a
  specificity fight with the checked rule. Only three need setting: the off hover is mixed from
  --switch-control-bg by the library, and the checked ones are read only while the switch is on.
  --switch-control-bg-checked-hover is a step brighter and is the one ratio below the floor, which
  is why the suite measures with the pointer parked away: hover is a mouse passing over a state
  that is already unambiguous, not a state anything rests in.
*/
const ToggleSwitch: FC<ToggleSwitchProps> = ({ label, description, checked, disabled, onChange }) => (
  <Switch
    className="panel w-full flex-col items-stretch gap-1 p-4 [--switch-control-bg-checked-hover:var(--color-secondary-400)] [--switch-control-bg-checked:var(--color-secondary-500)] [--switch-control-bg:var(--color-secondary-600)]"
    isDisabled={disabled}
    isSelected={checked}
    onChange={onChange}
  >
    {({ isSelected }) => (
      <>
        <Switch.Content className="flex w-full flex-row-reverse items-center justify-between gap-4">
          <Switch.Control>
            <Switch.Thumb className={isSelected ? "text-secondary-700" : undefined}>
              {isSelected && (
                <Switch.Icon>
                  <ArrowsRightLeftIcon className="size-3" aria-hidden="true" />
                </Switch.Icon>
              )}
            </Switch.Thumb>
          </Switch.Control>
          <Label>{label}</Label>
        </Switch.Content>

        {/*
          pl-0 undoes HeroUI's 52px indent, which exists to align the description under the label past
          a control sitting on the left. This row is reversed — the lever is on the right — so the
          indent pushed the sentence away from the words it belongs to.
        */}
        <Description className="pl-0">{description}</Description>
      </>
    )}
  </Switch>
);

export default ToggleSwitch;
