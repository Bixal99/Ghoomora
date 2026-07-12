"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, UserRound } from "lucide-react";
import { getAccountMenuLinks, type NavLink } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "hero" | "light";

function initials(name?: string | null, email?: string | null) {
  const source = (name ?? "").trim();
  if (source) {
    const parts = source.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || source[0]?.toUpperCase() || "?";
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export function UserAccountMenu({
  variant = "hero",
  menuLinks,
  mobile = false,
}: {
  variant?: Variant;
  menuLinks?: NavLink[];
  mobile?: boolean;
}) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const links = menuLinks ?? getAccountMenuLinks(user?.role);

  if (status === "loading") {
    return <span className={cn("block size-10 rounded-full", variant === "hero" ? "bg-white/15" : "bg-primary/10")} aria-hidden />;
  }

  if (status !== "authenticated" || !user) {
    if (mobile) {
      return (
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="accent" className="flex-1">
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button asChild variant={variant === "hero" ? "ghost" : "outline"} size="sm" className={variant === "hero" ? "text-white hover:bg-white/10" : undefined}>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild variant="accent" size="sm"><Link href="/sign-up">Sign up</Link></Button>
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="grid gap-1">
        {links.map((link) => (
          <Link key={link.href} className="flex items-center gap-2 rounded-xl p-3 font-bold hover:bg-muted" href={link.href}>
            <UserRound size={16} /> {link.label}
          </Link>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={() => signOut({ redirectTo: "/" })}>
          <LogOut size={15} /> Sign out
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className={cn(
            "focus-ring grid size-10 place-items-center overflow-hidden rounded-full border font-extrabold transition",
            variant === "hero"
              ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
              : "border-primary/15 bg-accent text-primary hover:brightness-95",
          )}
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-sm">{initials(user.name, user.email)}</span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-[200] w-60 rounded-2xl border border-primary/10 bg-[#fffdf8] p-2 text-primary shadow-2xl"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-extrabold">{user.name || "Account"}</p>
            {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
          </div>
          <div className="my-1 h-px bg-primary/10" />
          {links.map((link) => (
            <DropdownMenu.Item key={link.href} asChild>
              <Link href={link.href} className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:bg-muted">
                <UserRound size={16} /> {link.label}
              </Link>
            </DropdownMenu.Item>
          ))}
          <div className="my-1 h-px bg-primary/10" />
          <DropdownMenu.Item
            onSelect={() => signOut({ redirectTo: "/" })}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-[#a53434] outline-none focus:bg-[#fdecec]"
          >
            <LogOut size={16} /> Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
