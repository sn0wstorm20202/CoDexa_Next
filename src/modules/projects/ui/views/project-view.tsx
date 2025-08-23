"use client";

import { Suspense } from "react";

import { useState } from "react";

import { Fragment } from "@/generated/prisma";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ProjectHeader } from "../components/project-header";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";




interface Props {
    projectId: string;
};
export const ProjectView = ({ projectId }: Props) => {

    const [activeFragment,setActiveFragment] = useState<Fragment | null> (null);

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0"
                > 
                    <Suspense fallback={<p>Loading Project...</p>}>
                    <ProjectHeader projectId={projectId}/>
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
                    TODO:Preview
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export default ProjectView;