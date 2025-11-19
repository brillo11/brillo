import { getAdminClassDetail } from "@/serverActions/admin/class.sa";
import { ClassEditView } from "./view";

export default async function AdminClassEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const classData = await getAdminClassDetail(id);

  return <ClassEditView classData={classData} />;
}

