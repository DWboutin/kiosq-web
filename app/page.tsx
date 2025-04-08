import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold bg-categories-bakery-bg text-categories-bakery-text">
        Hello World
      </h1>

      <div className="mt-8 p-4 border rounded-lg bg-secondary/10">
        <h2 className="text-xl font-semibold mb-2">Developer Resources</h2>
        <Link
          href="/kitchen-sink"
          className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          View Component Kitchen Sink
        </Link>
      </div>
    </div>
  );
}
