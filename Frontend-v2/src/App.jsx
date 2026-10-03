import { RouterProvider } from "react-router-dom";

import router from "./app/routes";

import { ThemeProvider } from "./context/ThemeContext";
import { TerminalProvider } from "./context/TerminalContext";

function App() {
  return (
    <ThemeProvider>
      <TerminalProvider>
        <RouterProvider router={router} />
      </TerminalProvider>
    </ThemeProvider>
  );
}

export default App;