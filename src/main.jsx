import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CookiesProvider } from "react-cookie";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "1097872418993-1ki83r398ukrccj70g3hglcdj73q5o08.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CookiesProvider defaultSetOptions={{ path: "/" }}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </CookiesProvider>
  </StrictMode>,
);
