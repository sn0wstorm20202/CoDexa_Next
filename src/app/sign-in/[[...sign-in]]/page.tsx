"use client";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { c } from "node_modules/@inngest/agent-kit/dist/agent-Df6e3z3X";

const Page = () => {
  const currentTheme = useCurrentTheme();
  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full">
      <section className="space-y-6 pt-[16vh] 2xl:pt-48">
        <div className="flex flex-col items-center">
          <SignIn
            appearance={{
              baseTheme: currentTheme === "dark" ? dark : undefined,
              elements: {
                cardBox: "border! shadow-md! rounded-lg!"
              }
            }}
          />
        </div>
      </section>
    </div>
  );
}

export default Page;