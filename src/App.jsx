import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Countdown from "./components/Countdown";
import Story from "./components/Story";
import Events from "./components/Events";
import Gallery from "./components/Gallery";
import Rsvp from "./components/Rsvp";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Countdown />
      <Story />
      <Events />
      <Gallery />
      <Rsvp />
      <Footer />
    </>
  );
}
