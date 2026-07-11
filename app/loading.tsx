import { MountainLoader } from "@/components/reactbits/mountain-loader";

export default function Loading() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-[#e5eee9]">
      <MountainLoader />
    </main>
  );
}
