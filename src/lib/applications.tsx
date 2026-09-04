import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Status = "Applied" | "Interview" | "Offer" | "Rejected";
export type AccentColor = "cyan" | "violet" | "rose" | "amber";

export interface Application {
  id: string;
  role: string;
  company: string;
  location: string;
  type: string;
  status: Status;
  salary: string;
  /** ISO date, e.g. 2026-06-12 */
  date: string;
  notes: string;
  color: AccentColor;
}

export const STATUSES: Status[] = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

export const COLORS: AccentColor[] = ["cyan", "violet", "rose", "amber"];

const STORAGE_KEY = "hireflow.applications.v1";

function iso(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export const seedApplications: Application[] = [
  {
    id: "seed-1",
    role: "Senior Frontend Engineer",
    company: "Nimbus Labs",
    location: "Remote",
    type: "Full-time",
    status: "Interview",
    salary: "$165k",
    date: iso(2),
    notes: "Second round with the platform team on Thursday.",
    color: "cyan",
  },
  {
    id: "seed-2",
    role: "Product Designer",
    company: "Foldwork Studio",
    location: "New York",
    type: "Hybrid",
    status: "Applied",
    salary: "$130k",
    date: iso(4),
    notes: "Referred by Maya.",
    color: "violet",
  },
  {
    id: "seed-3",
    role: "Data Scientist",
    company: "Kestrel AI",
    location: "Remote",
    type: "Full-time",
    status: "Offer",
    salary: "$185k",
    date: iso(7),
    notes: "Offer expires in 5 days. Negotiating equity.",
    color: "rose",
  },
  {
    id: "seed-4",
    role: "Backend Engineer",
    company: "Marrow Systems",
    location: "Austin",
    type: "On-site",
    status: "Rejected",
    salary: "$145k",
    date: iso(11),
    notes: "Role put on hold.",
    color: "amber",
  },
  {
    id: "seed-5",
    role: "Engineering Manager",
    company: "Loft & Co",
    location: "Berlin",
    type: "Full-time",
    status: "Interview",
    salary: "$190k",
    date: iso(1),
    notes: "Intro call went well.",
    color: "violet",
  },
  {
    id: "seed-6",
    role: "Full Stack Developer",
    company: "Pinehold",
    location: "Remote",
    type: "Contract",
    status: "Applied",
    salary: "$120k",
    date: iso(0),
    notes: "",
    color: "cyan",
  },
];

export function initialsFor(role: string) {
  const parts = role.trim().split(/\s+/).slice(0, 2);
  const value = parts.map((w) => w[0]?.toUpperCase() ?? "").join("");
  return value || "JO";
}

export function formatDate(value: string) {
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

interface Store {
  applications: Application[];
  addApplication: (input: Omit<Application, "id">) => void;
  updateApplication: (id: string, input: Partial<Application>) => void;
  removeApplication: (id: string) => void;
  replaceAll: (list: Application[]) => void;
  resetToSample: () => void;
}

const ApplicationsContext = createContext<Store | null>(null);

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] =
    useState<Application[]>(seedApplications);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Application[];
        if (Array.isArray(parsed)) setApplications(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch {
      /* ignore quota errors */
    }
  }, [applications]);

  const addApplication = useCallback((input: Omit<Application, "id">) => {
    setApplications((prev) => [{ ...input, id: newId() }, ...prev]);
  }, []);

  const updateApplication = useCallback(
    (id: string, input: Partial<Application>) => {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...input } : a)),
      );
    },
    [],
  );

  const removeApplication = useCallback((id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const replaceAll = useCallback((list: Application[]) => {
    setApplications(list);
  }, []);

  const resetToSample = useCallback(() => {
    setApplications(seedApplications);
  }, []);

  const value = useMemo<Store>(
    () => ({
      applications,
      addApplication,
      updateApplication,
      removeApplication,
      replaceAll,
      resetToSample,
    }),
    [
      applications,
      addApplication,
      updateApplication,
      removeApplication,
      replaceAll,
      resetToSample,
    ],
  );

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) {
    throw new Error("useApplications must be used inside ApplicationsProvider");
  }
  return ctx;
}

export function useStats(applications: Application[]) {
  return useMemo(() => {
    const total = applications.length;
    const count = (s: Status) =>
      applications.filter((a) => a.status === s).length;
    const responded = applications.filter((a) => a.status !== "Applied").length;
    return {
      total,
      applied: count("Applied"),
      interviews: count("Interview"),
      offers: count("Offer"),
      rejected: count("Rejected"),
      responseRate: total ? Math.round((responded / total) * 100) : 0,
    };
  }, [applications]);
}

export function toCsv(applications: Application[]) {
  const header = [
    "role",
    "company",
    "location",
    "type",
    "status",
    "salary",
    "date",
    "notes",
  ];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = applications.map((a) =>
    [
      a.role,
      a.company,
      a.location,
      a.type,
      a.status,
      a.salary,
      a.date,
      a.notes,
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

function splitCsvLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

export function fromCsv(text: string): Application[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0] ?? "").map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  return lines.slice(1).map((line, i) => {
    const cells = splitCsvLine(line);
    const get = (name: string, fallback = "") => {
      const at = idx(name);
      return at >= 0 ? (cells[at] ?? fallback) : fallback;
    };
    const status = get("status", "Applied") as Status;
    return {
      id: newId(),
      role: get("role", "Untitled role"),
      company: get("company", "Unknown"),
      location: get("location", "Remote"),
      type: get("type", "Full-time"),
      status: STATUSES.includes(status) ? status : "Applied",
      salary: get("salary", "—"),
      date: get("date", new Date().toISOString().slice(0, 10)),
      notes: get("notes"),
      color: COLORS[i % COLORS.length] ?? "cyan",
    } satisfies Application;
  });
}
