import Create from "@/components/Create";

/*
  The heading and a line of what the app does, rendered on the server — everything under them waits
  for the stores to rehydrate, so without these the HTML a crawler receives was a spinner and
  nothing else, and the search snippet was stitched from button labels ("Crear equipos").

  Present for the accessibility tree, absent from the screen, as the heading already was: this page
  had no heading at all, so a screen reader landed on a textarea with no idea what it had opened —
  but the app is one page with its name already in the header, and a visible "Armar los equipos"
  above the form was a title telling you what the only screen does. It is the same text a person
  hears, so what search reads is what a screen reader says, not a second page written for robots.
*/
const Home = () => (
  <>
    <div className="sr-only">
      <h1>Armá los equipos de fútbol</h1>
      <p>Pegá la lista del grupo de WhatsApp y Teammaker la divide en dos equipos, lista para compartir.</p>
    </div>
    <Create />
  </>
);

export default Home;
