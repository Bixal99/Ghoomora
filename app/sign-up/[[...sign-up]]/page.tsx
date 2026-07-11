import { SignUp } from "@clerk/nextjs";

export default async function Page({ searchParams }: { searchParams: Promise<{ redirect_url?: string }> }) {
  const { redirect_url } = await searchParams;
  const fallback = redirect_url && redirect_url.startsWith("/") ? redirect_url : "/dashboard";
  return (
    <main className="grid min-h-screen place-items-center bg-[#e5eee9] p-6">
      <SignUp fallbackRedirectUrl={fallback} signInUrl={"/sign-in?redirect_url=" + encodeURIComponent(fallback)} />
    </main>
  );
}
