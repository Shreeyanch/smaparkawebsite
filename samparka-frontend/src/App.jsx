import React, { useState } from "react";
import MainApp from "./MainApp";
import AppStore from "./AppStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./context/AuthContext";
import { StoreAuthProvider } from "./context/StoreAuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { MantineProvider } from "@mantine/core";
import Vote from "./Vote";

const App = () => {
  // Initialize the QueryClient instance ONCE — creating it inside the component
  // body (without useState) causes a new instance on every render, which remounts
  // the entire app tree and looks like a "page reload".
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10000,
      },
    },
  }));

  // Resolve subdomain synchronously so the first render is already correct —
  // using useEffect caused MainApp to flash on the first render for store subdomains.
  const [subdomain] = useState(() => {
    const host = window.location.hostname;

    if (host.includes("localhost")) {
      const devStore = new URLSearchParams(window.location.search).get("store");
      if (devStore) return devStore;
      const parts = host.split(".");
      return parts.length > 1 ? parts[0] : null;
    }

    const mainDomains = ["samparka.co", "www.samparka.co"];
    if (mainDomains.includes(host)) return null;

    const parts = host.split(".");
    return parts.length >= 3 ? parts[0] : null;
  });

  if (!subdomain || subdomain === "" || subdomain === "www") {
    return (
      <MantineProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <MainApp />
              <ReactQueryDevtools initialIsOpen={false} />
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </MantineProvider>
    );
    // } else if (subdomain === "vote") {
    //   return (
    //     <ThemeProvider>
    //       <QueryClientProvider client={queryClient}>
    //         <Vote />
    //         <ReactQueryDevtools initialIsOpen={false} />
    //       </QueryClientProvider>
    //     </ThemeProvider>
    //   );
  } else {
    return (
      <MantineProvider>
        <ThemeProvider>
          <StoreAuthProvider>
            <QueryClientProvider client={queryClient}>
              <AppStore subdomain={subdomain} />
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </StoreAuthProvider>
        </ThemeProvider>
      </MantineProvider>
    );
  }
};

export default App;
