import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./landing/Landing";
import ScrollToTop from "./ScrollToTop";
import { ToastContainer } from "react-toastify";
import Home from "./landing/pages/Home";
import About from "./landing/pages/About";
import Contact from "./landing/pages/Contact";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastContainer />
      <Routes>
        {/* <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} /> */}
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
