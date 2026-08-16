import Footer from "./components/Footer";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";

const Landing = () => {
  return (
    <main className="w-full min-h-screen">
      <Header />
      <Outlet />
      <Footer />
    </main>
  );
};

export default Landing;
