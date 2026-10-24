import EnchantedForestPlayground from "../components/playground/EnchantedForestPlayground";

export default function PlaygroundPage() {
  return (
    <main className="min-h-screen w-full bg-[#080604] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[1240px]">
        <EnchantedForestPlayground />
      </div>
    </main>
  );
}
