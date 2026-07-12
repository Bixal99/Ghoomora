import Link from "next/link";
import { Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CatalogSetupPanel({
  title = "Connect your database",
  description = "Public catalog data comes from your Postgres database. Set DATABASE_URL from .env.example, run npm run db:migrate, create the admin with npm run admin:create, then add regions and destinations via Prisma Studio (see docs/ADDING_REAL_DATA.md).",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="grid min-h-[50vh] place-items-center py-16">
      <Card className="max-w-lg p-9 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted">
          <Database />
        </span>
        <h2 className="display-title mt-5 text-4xl">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/">Return to home</Link>
        </Button>
      </Card>
    </div>
  );
}
