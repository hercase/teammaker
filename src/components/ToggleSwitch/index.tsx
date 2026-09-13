"use client";

import { FC } from "react";
import { Description, Label, Switch } from "@heroui/react";

interface ToggleSwitchProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
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
*/
const ToggleSwitch: FC<ToggleSwitchProps> = ({ label, description, checked, disabled, onChange }) => (
  <Switch
    className="panel w-full flex-col items-stretch gap-1 p-4"
    isDisabled={disabled}
    isSelected={checked}
    onChange={onChange}
  >
    <Switch.Content className="flex w-full flex-row-reverse items-center justify-between gap-4">
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Label>{label}</Label>
    </Switch.Content>

    {/*
      pl-0 undoes HeroUI's 52px indent, which exists to align the description under the label past
      a control sitting on the left. This row is reversed — the lever is on the right — so the
      indent pushed the sentence away from the words it belongs to.
    */}
    <Description className="pl-0">{description}</Description>
  </Switch>
);

export default ToggleSwitch;
