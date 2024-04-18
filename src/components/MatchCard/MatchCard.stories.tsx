import type { Meta, StoryObj } from "@storybook/react";
import MatchCard from ".";

const meta = {
  title: "components/MatchCard",
  component: MatchCard,
} satisfies Meta<typeof MatchCard>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    match: {
      lineup: ["1", "2", "3"],
      players: [
        { _key: "1", name: "Juan", details: "Portero" },
        { _key: "2", name: "Pedro", details: "Defensa" },
        { _key: "3", name: "Pablo", details: "Delantero" },
      ],
      location: "Cancha de la esquina",
      date: new Date(),
      random: false,
      colors: { teamA: "blue", teamB: "red" },
      history: [{ type: "replace", old_name: "Juan", new_name: "Juanito", date: new Date() }],
      maxPlayers: 10,
    },
    organizer: {
      name: "Juan",
      nickname: "Juancho",
      email: "juan@gmail.com",
      image: "https://randomuser.me",
    },
  },
};
