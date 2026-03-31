import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-primary/20 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link href="/">
          <Button className="rounded-full gap-2">
            <Home className="h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
