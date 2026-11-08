// Server-only: reads invitation JSON files from disk. Client code imports from ./invitation instead.
import fs from "node:fs";
import path from "node:path";
import { TEMPLATE_IDS, type Invitation, type InvitationData } from "./invitation";

const DATA_DIR = path.join(process.cwd(), "data", "invitations");

export function listInvitationSlugs(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

export function getInvitation(slug: string): Invitation | null {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const file = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (err) {
    throw new Error(`data/invitations/${slug}.json is not valid JSON: ${(err as Error).message}`);
  }
  const data = raw as InvitationData;
  const problems = validate(data);
  if (problems.length) {
    throw new Error(`data/invitations/${slug}.json has problems:\n- ${problems.join("\n- ")}`);
  }
  return { ...data, slug };
}

function validate(d: InvitationData): string[] {
  const p: string[] = [];
  if (!TEMPLATE_IDS.includes(d.template)) p.push(`"template" must be one of: ${TEMPLATE_IDS.join(", ")}`);
  if (!d.couple?.groom?.name) p.push(`"couple.groom.name" is required`);
  if (!d.couple?.bride?.name) p.push(`"couple.bride.name" is required`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.event?.date ?? "")) p.push(`"event.date" must look like 2027-01-31`);
  if (!/^\d{2}:\d{2}$/.test(d.event?.time ?? "")) p.push(`"event.time" must look like 18:30`);
  if (!d.event?.timezone) p.push(`"event.timezone" is required, e.g. "Asia/Kolkata"`);
  const items = d.program?.items ?? [];
  items.forEach((item, i) => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(item.dateTime ?? "")) {
      p.push(`"program.items[${i}].dateTime" must look like 2027-01-31T18:30`);
    }
  });
  if (d.guestGroups) {
    const ids = new Set<string>();
    items.forEach((item, i) => {
      if (!item.id) p.push(`"program.items[${i}].id" is required when "guestGroups" is used`);
      else if (ids.has(item.id)) p.push(`"program.items[${i}].id" "${item.id}" is used twice`);
      else ids.add(item.id);
    });
    for (const [group, events] of Object.entries(d.guestGroups)) {
      if (!/^[a-z0-9-]+$/.test(group))
        p.push(`guest group "${group}" may only use lowercase letters, digits and dashes`);
      if (!Array.isArray(events) || !events.length) p.push(`"guestGroups.${group}" must list at least one event id`);
      else
        for (const id of events)
          if (!ids.has(id)) p.push(`"guestGroups.${group}" lists "${id}", which no program item has`);
    }
  }
  return p;
}
