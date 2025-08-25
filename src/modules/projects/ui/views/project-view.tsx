"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { json } from "stream/consumers";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FragmentWeb } from "../components/fragment-web";
import { ProjectHeader } from "../components/project-header";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { Suspense, useState } from "react";


import { Fragment } from "generated/prisma";



interface Props {
    projectId: string;
};
export const ProjectView = ({ projectId }: Props) => {
    const [activeFragment, setActiveFragment] = useState < Fragment | null>(null);

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0"
                >
                    <Suspense>fallback={<p>Loading project...</p>}
                      <ProjectHeader projectId = { projectId } />
                    </Suspense>
                    <Suspense fallback={<p>Loading messages...</p>}>
                        <MessagesContainer
                         projectId={projectId}
                         activeFragment = {activeFragment}
                         setActiveFragment = {setActiveFragment}
                          />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle className="bg-gray-200" />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}>
                    { !!activeFragment && <FragmentWeb data={activeFragment} />}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export default ProjectView;