import { FilevrWorkbenchPage } from "@/components/workbench/filevr-workbench-page";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  return <FilevrWorkbenchPage user={user} />;
}
