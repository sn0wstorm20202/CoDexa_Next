
// "use client";
// const getUsers = async () => {

//     return (
//         <div>
//             <pre>Hello World</pre>
//         </div>
//     );
// }
// export default getUsers; 

// import { useQuery } from "@tanstack/react-query";

// import { useTRPC } from "@/trpc/client";
// const page = () => {
//     const trpc = useTRPC();
//     const { data } = useQuery(trpc.createAI.queryOptions({ text: "Sadhitra!" }));
//     return (
//         <div>
//            <pre>{JSON.stringify(data)}</pre>
//         </div>
//     );
// }
// export default page;


import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./client";
import { Suspense } from "react";
const page = async () => {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.createAI.queryOptions({ text: "Sadhitra!" }));
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<div>Loading...</div>}>
                <Client />
            </Suspense>
        </HydrationBoundary>
    );
}
export default page;