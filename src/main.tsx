import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import App from "./App";
import "./index.css";

// Capture Google OAuth tokens BEFORE React mounts
const hash = window.location.hash;
const search = window.location.search;
// Debug: log what comes back from OAuth
if (hash.length > 1 || search.includes("code=")) {
  console.log("[Prime OAuth Debug] hash:", hash.substring(0, 200));
  console.log("[Prime OAuth Debug] search:", search.substring(0, 200));
}
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
