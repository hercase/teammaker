import type { Meta, StoryObj } from "@storybook/react";
import MatchCard from ".";

const meta = {
  title: "components/MatchCard",
  component: MatchCard,
  argTypes: {
    colors: {},
  },
} satisfies Meta<typeof MatchCard>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    location: "Cancha de la esquina",
    date: new Date(),
    organizer: {
      name: "Juan",
      nickname: "Juancho",
      email: "juan@gmail.com",
      phone: "123456789",
    },
    random: false,
    colors: { teamA: "blue", teamB: "red" },
    players: [
      { id: "1", name: "Juan", details: "Portero" },
      { id: "2", name: "Pedro", details: "Defensa" },
      { id: "3", name: "Pablo", details: "Delantero" },
    ],
    bench: [
      { id: "4", name: "Jose", details: "Defensa" },
      { id: "5", name: "Luis", details: "Delantero" },
    ],
    history: [{ type: "replace", old_name: "Juan", new_name: "Juanito", date: new Date() }],
  },
};
