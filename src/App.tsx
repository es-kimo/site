import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { Outlet } from "react-router";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="max-w-blog mx-auto">
        <Header />
        <Outlet />
      </div>
    </ThemeProvider>
  );
}

export default App;
