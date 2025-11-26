import { getStudentProfile } from "@/serverActions/student/profile.actions";
import { StudentProfileClient } from "./_components/student-profile-client";

export default async function StudentProfilePage() {
  const profile = await getStudentProfile();

  return <StudentProfileClient initialProfile={profile} />;
}
