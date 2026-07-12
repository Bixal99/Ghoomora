import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeHeroCta() {
  return (
    <div className="mt-9">
      <Button asChild size="lg" variant="accent">
        <Link href="/sign-up">
          Get Started <ArrowRight size={18} />
        </Link>
      </Button>
    </div>
  );
}
