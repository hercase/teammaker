import type { Meta, StoryObj } from "@storybook/react";
import InfoCard from ".";

const meta = {
  title: "components/InfoCard",
  component: InfoCard,
} satisfies Meta<typeof InfoCard>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    playersLength: 10,
    date: new Date(),
    location: "Cancha de fútbol 5",
    organizer: {
      name: "Juan Perez",
      email: "",
      nickname: "Juan",
      image: "https://randomuser.me",
    },
    random: false,
  },
};

export const Random: Story = {
  args: {
    ...Default.args,
    random: true,
  },
};
