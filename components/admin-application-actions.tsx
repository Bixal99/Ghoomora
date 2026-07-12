"use client";

import { toast } from "sonner";
import { approveVendorApplication, rejectVendorApplication } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : "Something went wrong.";
}

export function ApproveApplicationButton({ applicationId }: { applicationId: string }) {
  async function action(formData: FormData) {
    try {
      await approveVendorApplication(formData);
      toast.success("Application approved");
    } catch (reason) {
      toast.error(errorMessage(reason));
    }
  }

  return (
    <form action={action}>
      <input type="hidden" name="applicationId" value={applicationId} />
      <Button type="submit">Approve application</Button>
    </form>
  );
}

export function RejectApplicationForm({ applicationId }: { applicationId: string }) {
  async function action(formData: FormData) {
    try {
      await rejectVendorApplication(formData);
      toast.success("Application rejected");
    } catch (reason) {
      toast.error(errorMessage(reason));
    }
  }

  return (
    <form action={action} className="grid flex-1 gap-2">
      <input type="hidden" name="applicationId" value={applicationId} />
      <label className="text-xs font-bold text-muted-foreground">Rejection note (optional, shown to applicant)</label>
      <div className="flex gap-2">
        <input name="rejectionNote" className="focus-ring h-11 flex-1 rounded-xl border border-primary/15 bg-white px-3 text-sm" placeholder="Reason for rejection" />
        <Button variant="outline" type="submit">Reject</Button>
      </div>
    </form>
  );
}
