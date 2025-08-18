import { Fragment, MessageRole, MessageType } from "generated/prisma";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { A } from "node_modules/@inngest/agent-kit/dist/agent-Df6e3z3X";
import { Assistant } from "next/font/google";

import { ChevronRightIcon, Code2Icon } from "lucide-react";



interface UserMessageProps {
    content: string;
}

const UserMessage = ({ content }: UserMessageProps) => {
    return (
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
                {content}
            </Card>
        </div>
    );
}


interface FragmentCardProps {
    fragment: Fragment;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
};
const FragmentCard = ({
    fragment,
    isActiveFragment,
    onFragmentClick }:
    FragmentCardProps) => {
    return (
        <button
            className={cn(
                "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors",
                isActiveFragment &&
                "bg-secondary text-primary-foreground border-primary hover:bg-primary",
            )}
            onClick={() => onFragmentClick(fragment)}
        >
            <Code2Icon className="size-4 mt-0.5" />
            <div className="flex flex-col flex-1">
                <span className="text-sm font-medium line-clamp-1">
                    {fragment.title || "Untitled Fragment"}
                </span>
                <span className="text-sm">
                    Preview
                </span>
            </div>
            <div className="flex items-center justify-center mt-0.5">
                <ChevronRightIcon className="size-4 text-muted-foreground" />
            </div>
        </button>
    )
};

interface AssistantMessageProps {
    content: string;
    fragment: Fragment | null; // Optional fragment
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    type: MessageType;
};
const AssistantMessage = ({
    content,
    fragment,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type,
}: AssistantMessageProps) => {
    return (
        <div className={cn(
            "flex flex-col group px-2 pb-4",
            type === "ERROR" && "text-red-600 dark:text-red-400",
        )}>
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Image
                    src="/logo.svg"
                    alt="CoDexa"
                    width={20}
                    height={20}
                    className="shrink-0 rounded-full"
                />
                <span className="text-sm font-medium">CoDexa</span>
                <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
                </span>
            </div>
            <div className="pl-9 flex flex-col gap-y-4 ">
                <span className=" text-justify" >
                    {content}
                </span>
                {fragment && type === "RESULT" && (
                    <FragmentCard
                        fragment={fragment}
                        isActiveFragment={isActiveFragment}
                        onFragmentClick={onFragmentClick}
                    />
                )}
            </div>
        </div>
    )
};


interface MessageCardProps {
    content: string;
    role: MessageRole;
    fragment: Fragment | null; // Optional fragment
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    type: MessageType;
};
export const MessageCard = ({
    content,
    role,
    fragment,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type,
}: MessageCardProps) => {
    if (role === "ASSISTANT") {
        return (
            <AssistantMessage
                content={content}
                fragment={fragment}
                createdAt={createdAt}
                isActiveFragment={isActiveFragment}
                onFragmentClick={onFragmentClick}
                type={type}
            />
        )
    }
    return (
        <UserMessage
            content={content}
        />
    );
};