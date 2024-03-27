import type { Meta, StoryObj } from "@storybook/react";
import DateInput from ".";

const meta = {
  title: "components/DateInput",
  component: DateInput,
} satisfies Meta<typeof DateInput>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    error: false,
    variant: "outline",
  },
};
