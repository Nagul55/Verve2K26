import { getHackathon } from "@/actions/hackathon.actions";
import { EditHackathonForm } from "./EditHackathonForm";
import { redirect } from "next/navigation";

export default async function EditHackathonPage({ searchParams }: { searchParams: Promise<{ id: string }> }) {
  const { id: festId } = await searchParams;
  if (!festId) {
    redirect('/admin/events');
  }

  const hackathon = await getHackathon(festId);
  
  if (!hackathon) {
    redirect('/admin/events');
  }

  return <EditHackathonForm hackathon={hackathon} festId={festId} />;
}
