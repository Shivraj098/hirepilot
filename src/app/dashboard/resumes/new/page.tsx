import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ResumeUploadCard from "@/components/resume/resume-upload-card";

export default async function NewResumePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <ResumeUploadCard />
    </div>
  );
}
