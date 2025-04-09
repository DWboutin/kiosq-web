import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold bg-categories-bakery-bg text-categories-bakery-text">
        Hello World
      </h1>

      <div className="mt-8 p-4 border rounded-lg bg-secondary/10">
        <h2 className="text-xl font-semibold mb-2">Developer Resources</h2>
        <Button>View Component Kitchen Sink</Button>
      </div>
    </div>
  );
}
