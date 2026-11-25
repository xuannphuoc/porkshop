import { Routes, useLocation } from "react-router";
import { useEffect } from "react";
import { renderRoutes } from "./routes";

export default function App() {
  const location = useLocation();

  useEffect(function () {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <Routes>{renderRoutes()}</Routes>;
}
