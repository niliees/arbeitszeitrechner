

import dynamic from "next/dynamic";
const NewTimelineDemo = dynamic(() => import("./NewTimelineDemo"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950">
      <section className="w-full max-w-4xl p-6 md:p-12">
        <NewTimelineDemo />
      </section>
    </main>
  );
}
