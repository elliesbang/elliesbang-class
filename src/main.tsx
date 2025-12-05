import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // 있으면 유지, 없으면 삭제해도 됨

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
