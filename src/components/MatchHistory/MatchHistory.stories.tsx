import type { Meta, StoryObj } from "@storybook/react";
import MatchHistory from ".";

const meta = {
  title: "components/MatchHistory",
  component: MatchHistory,
} satisfies Meta<typeof MatchHistory>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    history: [
      {
        old_name: "Old name",
        new_name: "New name",
        type: "replace",
        date: new Date("2021-09-01T12:00:00Z"),
      },
      {
        old_name: "Old name",
        new_name: "New name",
        type: "rename",
        date: new Date("2021-09-01T13:00:00Z"),
      },
      {
        old_name: "Old name",
        new_name: "New name",
        type: "delete",
        date: new Date("2021-09-01T14:00:00Z"),
      },
    ],
  },
};
