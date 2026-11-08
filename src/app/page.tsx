import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { InvitationView } from "@/components/invitation/InvitationView";
import { SeaView } from "@/components/looks/SeaView";
import { formatFullDate } from "@/lib/dates";
import { coupleNames, type Invitation, type TemplateId } from "@/lib/invitation";
import { getInvitation } from "@/lib/load-invitations";

const SLUG = "zaid-zikra";

const VIEWS: Record<TemplateId, (props: { invitation: Invitation }) => ReactNode> = {
  noor: InvitationView,
  sea: SeaView,
};

export function generateMetadata(): Metadata {
  const inv = getInvitation(SLUG);
  if (!inv) return {};
  const title = inv.seo?.title ?? `${coupleNames(inv)} - Wedding Invitation`;
  const description =
    inv.seo?.description ??
    `You're invited to celebrate with ${coupleNames(inv)} on ${formatFullDate(inv.event.date)}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-svh bg-[#0f3d33]" />}>
      <HomeInvitation />
    </Suspense>
  );
}

function HomeInvitation() {
  const invitation = getInvitation(SLUG);
  if (!invitation) notFound();
  const View = VIEWS[invitation.template];
  return <View invitation={invitation} />;
}
