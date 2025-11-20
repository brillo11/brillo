import React from "react";
import { getPosts } from "@/serverActions/post.actions";
import { getCohortsForSelect } from "@/serverActions/admin/cohort";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import Link from "next/link";
import { PATH } from "@/shared/consts/path";
import AnnouncementsClientPage from "./components/announcements-client-page";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const [{ posts }, cohorts] = await Promise.all([
    getPosts("notice", 1, 50),
    getCohortsForSelect(),
  ]);

  return <AnnouncementsClientPage initialPosts={posts} cohorts={cohorts} />;
}
