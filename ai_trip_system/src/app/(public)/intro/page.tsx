import Feature from "./Feature";
import HeroSections from "./herosection";
import About from "./About";
import Members from "./members";
import Contact from "./Contact";

export default function IntroPage() {
  return (
    <div className="bg-gradient-to-r from-[#000080] to-[#00BFFF] min-h-screen">
      <HeroSections />
      <About />
      <Feature />
      <Members />
      <Contact />
    </div>
  );
}
