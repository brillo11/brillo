import { Suspense } from "react";
import { getProfileSettings } from "@/serverActions/profile/profile.actions";
import { ProfileClient } from "./_components/profile-client";

export default async function ProfilePage() {
  const profile = await getProfileSettings();

  return (
    <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
      <ProfileClient 
        user={profile}
      />
    </Suspense>
  );
}
