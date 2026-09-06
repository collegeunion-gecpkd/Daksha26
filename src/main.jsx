/* eslint-disable react-refresh/only-export-components */
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./main.scss";
import ErrorBoundary from "./Components/ErrorBoundary";
import Layout from "./Pages/Layout";
import Landing from "./Pages/Landing";
import Board from "./Pages/Board";
import NoPage from "./Pages/NoPage";
import Events from "./Pages/Events";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="/board" element={<Board />} />
          <Route path="/events" element={<Events />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
const root = container._reactRoot || (container._reactRoot = ReactDOM.createRoot(container));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
