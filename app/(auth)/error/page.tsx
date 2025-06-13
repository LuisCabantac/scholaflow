import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  return (
    <section className="relative flex min-h-[90dvh] items-center justify-center px-8 py-[8rem] md:grid md:h-full md:px-20 md:py-0">
      <div className="container">
        <div className="flex flex-col items-center gap-2">
          <Link href="/">
            <Logo size={10} />
          </Link>
          <Card className="mx-auto flex flex-col gap-4 border-0 bg-transparent shadow-none md:w-[24rem]">
            <CardHeader className="w-full text-center text-2xl font-medium tracking-tighter">
              Something went wrong
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-center text-muted-foreground">
                An error occurred while processing your request. Please try
                again.
              </p>
              <Button asChild className="w-full">
                <Link href="/">Go back home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
