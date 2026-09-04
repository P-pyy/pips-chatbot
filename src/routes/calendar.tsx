import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  AppShell,
  Avatar,
  PageHeading,
  StatusBadge,
  ghostButtonClass,
} from "@/components/app-shell";
import {
  formatDate,
  initialsFor,
  useApplications,
} from "@/lib/applications";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
  head: () => ({
    meta: [
      { title: "Application Calendar — Hireflow Job Tracker" },
      {
        name: "description",
        content:
          "A month view of when you applied to each role, so you know exactly when to follow up.",
      },
      { property: "og:title", content: "Application Calendar — Hireflow" },
      {
        property: "og:description",
        content:
          "A month view of when you applied to each role, so you know exactly when to follow up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarPage() {
  const { applications } = useApplications();
  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, typeof applications>();
    for (const a of applications) {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    }
    return map;
  }, [applications]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" },
  );

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const list: (string | null)[] = Array.from({ length: offset }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      list.push(iso);
    }
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [cursor]);

  const shift = (delta: number) => {
    setSelected(null);
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const monthCount = cells.filter((c) => c && byDate.has(c)).length;
  const selectedItems = selected ? byDate.get(selected) ?? [] : [];
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <AppShell>
      <PageHeading
        title="Calendar"
        subtitle={`${monthCount} active day${monthCount === 1 ? "" : "s"} in ${monthLabel}`}
      >
        <button onClick={() => shift(-1)} className={ghostButtonClass}>
          ← Prev
        </button>
        <button
          onClick={() =>
            setCursor({ year: now.getFullYear(), month: now.getMonth() })
          }
          className={ghostButtonClass}
        >
          Today
        </button>
        <button onClick={() => shift(1)} className={ghostButtonClass}>
          Next →
        </button>
      </PageHeading>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-line bg-frost/40 backdrop-blur-2xl p-4 md:p-6">
          <p className="font-display font-semibold text-lg tracking-tight mb-4">
            {monthLabel}
          </p>
          <div className="grid grid-cols-7 gap-1 md:gap-2 text-[11px] uppercase tracking-wider text-mute mb-2">
            {weekdays.map((d) => (
              <span key={d} className="text-center">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {cells.map((iso, i) => {
              if (!iso) return <div key={`empty-${i}`} className="h-16 md:h-20" />;
              const items = byDate.get(iso) ?? [];
              const isToday = iso === todayIso;
              const isSelected = iso === selected;
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(isSelected ? null : iso)}
                  className={`h-16 md:h-20 rounded-xl border p-1.5 text-left transition ${
                    isSelected
                      ? "border-cyan bg-cyan/10"
                      : "border-line bg-ink/40 hover:border-cyan/50"
                  }`}
                >
                  <span
                    className={`text-xs ${isToday ? "text-cyan font-semibold" : "text-mute"}`}
                  >
                    {Number(iso.slice(-2))}
                  </span>
                  {items.length > 0 ? (
                    <span className="mt-1 block text-[10px] text-foreground truncate">
                      {items.length} role{items.length === 1 ? "" : "s"}
                    </span>
                  ) : null}
                  <span className="mt-1 flex gap-0.5">
                    {items.slice(0, 4).map((a) => (
                      <span
                        key={a.id}
                        className={`size-1.5 rounded-full ${
                          a.status === "Applied"
                            ? "bg-cyan"
                            : a.status === "Interview"
                              ? "bg-amber"
                              : a.status === "Offer"
                                ? "bg-violet"
                                : "bg-rose"
                        }`}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-frost/40 backdrop-blur-2xl p-6">
          <h2 className="font-display font-semibold text-lg tracking-tight">
            {selected ? formatDate(selected) : "Upcoming follow-ups"}
          </h2>
          <p className="text-xs text-mute mt-1">
            {selected
              ? `${selectedItems.length} application${selectedItems.length === 1 ? "" : "s"} on this day`
              : "Roles you applied to most recently"}
          </p>

          <ul className="mt-4 space-y-3">
            {(selected
              ? selectedItems
              : [...applications]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 6)
            ).map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <Avatar initials={initialsFor(a.role)} color={a.color} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.role}</p>
                  <p className="text-xs text-mute truncate">
                    {a.company} · {formatDate(a.date)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
            {(selected ? selectedItems.length : applications.length) === 0 ? (
              <li className="text-sm text-mute py-6 text-center">
                Nothing on this day.
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
