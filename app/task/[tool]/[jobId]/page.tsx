import { notFound } from "next/navigation";
import { getToolBySlug } from "@/config/tools";
import { TaskShellClient } from "@/components/task/task-shell-client";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ tool: string; jobId: string }>;
}) {
  const { tool: toolSlug, jobId } = await params;
  const tool = getToolBySlug(toolSlug);
  if (!tool) notFound();

  return <TaskShellClient tool={tool} jobId={jobId} />;
}
