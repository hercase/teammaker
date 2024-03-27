import type { Meta, StoryObj } from "@storybook/react";
import ColorPicker from ".";

const meta = {
  title: "components/ColorPicker",
  component: ColorPicker,
} satisfies Meta<typeof ColorPicker>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Pick a color",
  },
};
