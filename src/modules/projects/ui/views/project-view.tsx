"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { json } from "stream/consumers";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { Suspense } from "react";


interface Props {
    projectId: string;
};
export const ProjectView = ({ projectId }: Props) => {

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0"
                >
                    <Suspense fallback={<p>Loading messages...</p>}>
                        <MessagesContainer projectId={projectId} />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle className="bg-gray-200" />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}>
                    TODO:Preview
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export default ProjectView;