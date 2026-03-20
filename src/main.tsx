import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import App from "./App";
import "./index.css";

// Capture Google OAuth tokens BEFORE React mounts
// Supabase puts provider_token in the URL hash on OAuth redirect
// We need to grab it before supabase-js consumes and discards it
const hash = window.location.hash;
if (hash.includes("provider_token=")) {
  const params = new URLSearchParams(hash.substring(1));
  const providerToken = params.get("provider_token");
  const providerRefreshToken = params.get("provider_refresh_token");
  const accessToken = params.get("access_token");

  if (providerToken && accessToken) {
    // Store temporarily so useAuth can pick it up
    sessionStorage.setItem("prime_provider_token", providerToken);
    if (providerRefreshToken) {
      sessionStorage.setItem("prime_provider_refresh_token", providerRefreshToken);
    }
    console.log("Captured Google provider token from OAuth redirect");
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
