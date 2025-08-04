"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
export const Client = () =>  {  
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.createAI.queryOptions({ text: "Sadhitra!" }));
    return (
        <div>
            <pre>{JSON.stringify(data)}</pre>
        </div>
    );
};