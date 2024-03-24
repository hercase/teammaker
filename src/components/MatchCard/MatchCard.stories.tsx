import type { Meta, StoryObj } from "@storybook/react";
import MatchCard from ".";

const meta = {
  title: "components/MatchCard",
  component: MatchCard,
} satisfies Meta<typeof MatchCard>;
export default meta;

type Story = StoryObj<typeof meta>;

/*   location: string;
  date: Date | null;
  organizer: string;
  random: boolean;
  colors: Colors;
  players: Player[];
  bench: Player[];
  history: MatchEvent[];
   */
export const Default: Story = {
  args: {
    location: "Cancha de la esquina",
    date: new Date(),
    organizer: "Juan Perez",
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
