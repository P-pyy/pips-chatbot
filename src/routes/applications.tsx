import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";

import {
  AppShell,
  Avatar,
  PageHeading,
  StatusBadge,
  ghostButtonClass,
  inputClass,
  primaryButtonClass,
} from "@/components/app-shell";
import { ApplicationDialog } from "@/components/application-dialog";
import {
  STATUSES,
  formatDate,
  fromCsv,
  initialsFor,
  toCsv,
  useApplications,
  type Application,
  type Status,
} from "@/lib/applications";

export const Route = createFileRoute("/applications")({
  component: ApplicationsPage,
  head: () => ({
    meta: [
      { title: "All Applications — Hireflow Job Tracker" },
      {
        name: "description",
        content:
          "Search, sort, edit and delete every job application, and import or export your list as CSV.",
      },
      { property: "og:title", content: "All Applications — Hireflow" },
      {
        property: "og:description",
        content:
          "Search, sort, edit and delete every job application, and import or export your list as CSV.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type SortKey = "date" | "role" | "company" | "status";

function ApplicationsPage() {
  const {
    applications,
    addApplication,
    updateApplication,
    removeApplication,
    replaceAll,
    resetToSample,
  } = useApplications();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [sort, setSort] = useState<SortKey>("date");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = applications.filter((a) => {
      const matchesQuery =
        !q ||
        [a.role, a.company, a.location, a.type, a.notes].some((v) =>
          v.toLowerCase().includes(q),
        );
      const matchesFilter = filter === "All" || a.status === filter;
      return matchesQuery && matchesFilter;
    });
    return [...list].sort((a, b) => {
      if (sort === "date") return b.date.localeCompare(a.date);
      if (sort === "status")
        return STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status);
      return a[sort].localeCompare(b[sort]);
    });
  }, [applications, query, filter, sort]);

  const exportCsv = () => {
    const blob = new Blob([toCsv(applications)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hireflow-applications.csv";
    link.click();
    URL.revokeObjectURL(url);
    setMessage(`Exported ${applications.length} applications.`);
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const parsed = fromCsv(text);
    if (parsed.length === 0) {
      setMessage("That file didn't contain any rows we could read.");
      return;
    }
    replaceAll([...parsed, ...applications]);
    setMessage(`Imported ${parsed.length} applications.`);
  };

  return (
    <AppShell
      actions={
        <button
          onClick={() => fileRef.current?.click()}
          className={`hidden sm:block ${ghostButtonClass}`}
        >
          Import CSV
        </button>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importCsv(file);
          e.target.value = "";
        }}
      />

      <PageHeading
        title="All applications"
        subtitle={`${rows.length} of ${applications.length} shown`}
      >
        <button onClick={exportCsv} className={ghostButtonClass}>
          Export CSV
        </button>
        <button onClick={resetToSample} className={ghostButtonClass}>
          Reset sample data
        </button>
        <button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className={primaryButtonClass}
        >
          + Add application
        </button>
      </PageHeading>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] mb-5">
        <input
          className={inputClass}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search role, company, location or notes…"
          aria-label="Search applications"
        />
        <select
          className={inputClass}
          value={filter}
          onChange={(e) => setFilter(e.target.value as "All" | Status)}
          aria-label="Filter by status"
        >
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort applications"
        >
          <option value="date">Newest first</option>
          <option value="role">Role A–Z</option>
          <option value="company">Company A–Z</option>
          <option value="status">Stage order</option>
        </select>
      </div>

      {message ? (
        <p className="mb-4 text-xs text-cyan bg-cyan/10 border border-cyan/20 rounded-xl px-3 py-2">
          {message}
        </p>
      ) : null}

      <div className="rounded-3xl border border-line bg-frost/40 backdrop-blur-2xl p-4 md:p-6">
        <div className="hidden md:grid grid-cols-[1.7fr_1fr_.9fr_.7fr_.7fr_auto] gap-4 px-3 pb-3 text-[11px] uppercase tracking-wider text-mute border-b border-line">
          <span>Role</span>
          <span>Company</span>
          <span>Status</span>
          <span>Salary</span>
          <span>Applied</span>
          <span className="text-right">Actions</span>
        </div>

        {rows.length === 0 ? (
          <p className="px-3 py-12 text-center text-sm text-mute">
            No applications match your search.
          </p>
        ) : (
          rows.map((application) => (
            <div
              key={application.id}
              className="border-b border-line/60 last:border-b-0"
            >
              <div className="grid gap-3 md:grid-cols-[1.7fr_1fr_.9fr_.7fr_.7fr_auto] md:gap-4 px-3 py-4 md:items-center">
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={initialsFor(application.role)}
                    color={application.color}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {application.role}
                    </p>
                    <p className="text-xs text-mute truncate">
                      {application.location} · {application.type}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-mute">{application.company}</p>
                <div>
                  <StatusBadge status={application.status} />
                </div>
                <p className="text-sm text-mute">{application.salary}</p>
                <p className="text-sm text-mute">
                  {formatDate(application.date)}
                </p>
                <div className="flex items-center gap-1 md:justify-end">
                  <button
                    onClick={() =>
                      setExpanded(
                        expanded === application.id ? null : application.id,
                      )
                    }
                    className="rounded-lg border border-line px-2 py-1 text-xs text-mute transition hover:text-foreground"
                  >
                    {expanded === application.id ? "Hide" : "Details"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(application);
                      setDialogOpen(true);
                    }}
                    className="rounded-lg border border-line px-2 py-1 text-xs text-mute transition hover:text-foreground"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeApplication(application.id)}
                    className="rounded-lg border border-line px-2 py-1 text-xs text-rose transition hover:bg-rose/10"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expanded === application.id ? (
                <div className="px-3 pb-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <p className="text-sm text-mute">
                    {application.notes || "No notes yet for this role."}
                  </p>
                  <select
                    className="rounded-xl border border-line bg-ink/60 px-3 py-2 text-sm focus:border-cyan focus:outline-none"
                    value={application.status}
                    onChange={(e) =>
                      updateApplication(application.id, {
                        status: e.target.value as Status,
                      })
                    }
                    aria-label="Change status"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <ApplicationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initial={editing}
        onSave={(values) => {
          if (editing) updateApplication(editing.id, values);
          else addApplication(values);
        }}
      />
    </AppShell>
  );
}
