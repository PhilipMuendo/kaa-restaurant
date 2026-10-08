import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Fire from "@/components/Fire";
import Menu from "@/components/Menu";
import Bar from "@/components/Bar";
import Supply from "@/components/Supply";
import Week from "@/components/Week";
import Book from "@/components/Book";
import Private from "@/components/Private";
import Visit from "@/components/Visit";
import Footer from "@/components/Footer";
import TableTicket from "@/components/TableTicket";
import { BookingProvider } from "@/lib/booking";

export default function Home() {
  return (
    <BookingProvider>
      <Nav />
      <main>
        <Hero />
        <Fire />
        <Menu />
        <Bar />
        <Supply />
        <Week />
        <Book />
        <Private />
        <Visit />
      </main>
      <Footer />
      <TableTicket />
    </BookingProvider>
  );
}
