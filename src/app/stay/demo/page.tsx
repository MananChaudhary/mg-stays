import { redirect } from "next/navigation";

/** Legacy URL used by older preview links — redirect to the correct routes */
export default async function StayDemoRedirect({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const { property } = await searchParams;
  if (property) {
    redirect(`/stay/preview/${property}`);
  }
  redirect("/stay/demo-booking-sarah");
}
