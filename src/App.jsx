import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./landing/Landing";
import ScrollToTop from "./ScrollToTop";
import Home from "./landing/pages/Home";
import About from "./landing/pages/About";
import Contact from "./landing/pages/Contact";
import Signup from "./landing/auth/Signup";
import Login from "./landing/auth/Login";
import Otp from "./landing/auth/Otp";
import ResetPassword from "./landing/auth/ResetPassword";
import ForgotPassword from "./landing/auth/ForgotPassword";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastContainer />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route element={<Landing />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
