import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { App } from "./app";
import { RecordDetailPage } from "./features/records/record-detail-page";
import { RecordFormPage } from "./features/records/record-form-page";
import { RecordsPage } from "./features/records/records-page";
import { NotesPage } from "./features/notes/notes-page";
import { ActivityPage } from "./features/activity/activity-page";
import { AnalyticsPage } from "./features/analytics/analytics-page";
import { JobPage } from "./features/jobs/job-page";
import { SettingsPage } from "./features/settings/settings-page";
import { RecordWizard } from "./features/wizard/record-wizard";
import { SnapshotsPage } from "./features/snapshots/snapshots-page";
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
      { path: "records/new/guided", element: <RecordWizard /> },
      { path: "records/export", element: <JobPage /> },
      { path: "records/:id/edit", element: <RecordFormPage mode="edit" /> },
      { path: "records/:id", element: <RecordDetailPage /> },
      { path: "notes", element: <NotesPage /> },
      { path: "wizard", element: <Navigate to="/records/new/guided" replace /> },
      { path: "jobs", element: <Navigate to="/records/export" replace /> },
      { path: "collections", element: <SnapshotsPage /> },
      { path: "snapshots", element: <Navigate to="/collections" replace /> },
      { path: "activity", element: <ActivityPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
    ],
  },
]);

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
