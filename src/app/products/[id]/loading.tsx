import BackButton from "@/components/BackButton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-4xl p-4">
      <BackButton />
      <p className="py-8 text-center text-gray-500">กำลังโหลด...</p>
    </main>
  );
}
