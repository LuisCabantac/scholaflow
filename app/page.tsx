import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(116,143,252,0.3),rgba(255,255,255,0))]">
      <Nav showButton={true} />
      <Hero />
      <Footer />
    </main>
  );
}
