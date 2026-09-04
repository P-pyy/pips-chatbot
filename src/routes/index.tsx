import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  AppShell,
  Avatar,
  PageHeading,
  StatusBadge,
  cardClass,
  ghostButtonClass,
  primaryButtonClass,
} from "@/components/app-shell";
import { ApplicationDialog } from "@/components/application-dialog";
import {
  STATUSES,
  formatDate,
  initialsFor,
  useApplications,
  useStats,
  type Application,
  type Status,
} from "@/lib/applications";

export const Route = createFileRoute("/")({
  component: PipelinePage,
  head: () => ({
    meta: [
      { title: "Pipeline Overview — Hireflow Job Tracker" },
      {
        name: "description",
        content:
          "See every job application by stage, track interviews and offers, and move roles through your pipeline.",
      },
      { property: "og:title", content: "Pipeline Overview — Hireflow" },
      {
        property: "og:description",
        content:
          "See every job application by stage, track interviews and offers, and move roles through your pipeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const columnAccent: Record<Status, string> = {
  Applied: "text-cyan",
  Interview: "text-amber",
  Offer: "text-violet",
  Rejected: "text-rose",
};

function PipelinePage() {
  const { applications, addApplication, updateApplication, removeApplication } =
    useApplications();
  const stats = useStats(applications);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);

  const columns = useMemo(
    () =>
      STATUSES.map((status) => ({
        status,
        items: applications.filter((a) => a.status === status),
      })),
    [applications],
  );

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (application: Application) => {
    setEditing(application);
    setDialogOpen(true);
  };

  const move = (application: Application, direction: -1 | 1) => {
    const index = STATUSES.indexOf(application.status);
    const next = STATUSES[index + direction];
    if (next) updateApplication(application.id, { status: next });
  };

  return (
    <AppShell
      actions={
        <Link to="/applications" className={`hidden sm:block ${ghostButtonClass}`}>
          All applications
        </Link>
      }
    >
      <PageHeading
        title="Pipeline overview"
        subtitle={`${stats.total} tracked role${stats.total === 1 ? "" : "s"} · ${stats.interviews} in interview · ${stats.offers} offer${stats.offers === 1 ? "" : "s"}`}
      >
        <button onClick={openAdd} className={primaryButtonClass}>
          + Add application
        </button>
      </PageHeading>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Applied", value: stats.applied, tone: "text-cyan" },
          { label: "Interviews", value: stats.interviews, tone: "text-amber" },
          { label: "Offers", value: stats.offers, tone: "text-violet" },
          {
            label: "Response rate",
            value: `${stats.responseRate}%`,
            tone: "text-rose",
          },
        ].map((card) => (
          <div key={card.label} className={`${cardClass} p-5`}>
            <p className="text-mute text-xs uppercase tracking-wider">
              {card.label}
            </p>
            <p className={`font-display font-semibold text-3xl mt-2 ${card.tone}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => (
          <section
            key={column.status}
            className="rounded-3xl border border-line bg-frost/40 backdrop-blur-2xl p-4"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h2
                className={`font-display font-semibold text-sm tracking-tight ${columnAccent[column.status]}`}
              >
                {column.status}
              </h2>
              <span className="text-xs text-mute">{column.items.length}</span>
            </div>

            <div className="space-y-3">
              {column.items.length === 0 ? (
                <p className="text-xs text-mute px-1 py-6 text-center">
                  Nothing here yet.
                </p>
              ) : (
                column.items.map((application) => (
                  <article
                    key={application.id}
                    className="rounded-2xl border border-line bg-ink/50 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        initials={initialsFor(application.role)}
                        color={application.color}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {application.role}
                        </p>
                        <p className="text-xs text-mute truncate">
                          {application.company} · {application.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-mute">
                      <span>{application.salary}</span>
                      <span>{formatDate(application.date)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-3">
                      <button
                        onClick={() => move(application, -1)}
                        disabled={STATUSES.indexOf(application.status) === 0}
                        className="rounded-lg border border-line px-2 py-1 text-xs text-mute transition hover:text-foreground disabled:opacity-30"
                        aria-label="Move back a stage"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => move(application, 1)}
                        disabled={
                          STATUSES.indexOf(application.status) ===
                          STATUSES.length - 1
                        }
                        className="rounded-lg border border-line px-2 py-1 text-xs text-mute transition hover:text-foreground disabled:opacity-30"
                        aria-label="Move forward a stage"
                      >
                        →
                      </button>
                      <button
                        onClick={() => openEdit(application)}
                        className="ml-auto rounded-lg border border-line px-2 py-1 text-xs text-mute transition hover:text-foreground"
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
                  </article>
                ))
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-frost/40 backdrop-blur-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg tracking-tight">
            Latest activity
          </h2>
          <Link to="/applications" className="text-xs text-cyan hover:underline">
            View all
          </Link>
        </div>
        {applications.length === 0 ? (
          <p className="text-sm text-mute py-6 text-center">
            No applications yet. Add your first role to get started.
          </p>
        ) : (
          <ul className="divide-y divide-line/60">
            {applications.slice(0, 5).map((application) => (
              <li
                key={application.id}
                className="flex items-center gap-3 py-3 text-sm"
              >
                <Avatar
                  initials={initialsFor(application.role)}
                  color={application.color}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{application.role}</p>
                  <p className="text-xs text-mute truncate">
                    {application.company}
                  </p>
                </div>
                <StatusBadge status={application.status} />
                <span className="text-xs text-mute w-16 text-right">
                  {formatDate(application.date)}
                </span>
              </li>
            ))}
          </ul>
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
