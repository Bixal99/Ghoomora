"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#e5eee9] p-6"><div className="max-w-lg text-center"><p className="eyebrow text-[#5a7f73]">The trail paused</p><h1 className="display-title mt-3 text-6xl">We could not load this view.</h1><p className="mt-5 text-muted-foreground">Your data has not been changed. Try the request again.</p><Button className="mt-7" onClick={reset}>Try again</Button></div></main>;
}
