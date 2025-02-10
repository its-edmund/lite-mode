import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundLines } from "@/components/ui/background-lines";

export default function Login() {
  return (
    <div className="dark:bg-neutral-950 w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <h2 className="bg-clip-text text-center dark:text-neutral-200 text-2xl md:text-4xl lg:text-7xl font-sans relative z-20 font-bold tracking-tight">
          Let your ideas flow.
        </h2>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm md:text-lg py-2 z-20">
          Make fast and simple changes to your Org-mode notes, with Lite-mode.
        </p>
        <Button className="font-medium z-20">
          <Github />
          Sign in with Github
        </Button>
      </div>
    </div>
  );
}
