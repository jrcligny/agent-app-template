import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { App } from "./app";
import { RecordDetailPage } from "./features/records/record-detail-page";
import { RecordFormPage } from "./features/records/record-form-page";
import { RecordsPage } from "./features/records/records-page";
import { NotesPage } from "./features/notes/notes-page";
import { DashboardPage } from "./features/workbench/dashboard-page";
import "./index.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing root element");
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "records", element: <RecordsPage /> },
      { path: "records/new", element: <RecordFormPage mode="create" /> },
      { path: "records/:id/edit", element: <RecordFormPage mode="edit" /> },
      { path: "records/:id", element: <RecordDetailPage /> },
      { path: "notes", element: <NotesPage /> },
    ],
  },
]);

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
