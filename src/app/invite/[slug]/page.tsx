import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { InvitationView } from "@/components/invitation/InvitationView";
import { SeaView } from "@/components/looks/SeaView";
import { formatFullDate } from "@/lib/dates";
import { coupleNames, type Invitation as InvitationData, type TemplateId } from "@/lib/invitation";
import { getInvitation, listInvitationSlugs } from "@/lib/load-invitations";

const VIEWS: Record<TemplateId, (props: { invitation: InvitationData }) => ReactNode> = {
  noor: InvitationView,
  sea: SeaView,
};

export function generateStaticParams() {
  return listInvitationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/invite/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const inv = getInvitation(slug);
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

export default function InvitePage({ params }: PageProps<"/invite/[slug]">) {
  // URL data stays behind Suspense so the route's shell can be served instantly.
  return (
    <Suspense fallback={<div className="h-svh bg-[#0f3d33]" />}>
      <Invitation params={params} />
    </Suspense>
  );
}

async function Invitation({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = getInvitation(slug);
  if (!invitation) notFound();
  const View = VIEWS[invitation.template];
  return <View invitation={invitation} />;
}
