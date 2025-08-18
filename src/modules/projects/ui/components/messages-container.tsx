import { useSuspenseQuery ,useQuery} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { MessageForm } from "./message-form";
import { MessageCard } from "./message-card";
import { useEffect, useRef, useState } from "react";
  


/*

NOTE: There is slight changes in this code base as there is showing error following the video code
I have decided to fix it using claude and claude has ggiven me this code without changing the core logic
THANKS!!!!

*/ 
interface Props {
  projectId: string;
}

export const MessagesContainer = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // data -> messages
  const { data: messages } = useQuery( //In video he use useSuspenseQuery
    trpc.messages.getMany.queryOptions({
      projectId,
    })
  );

  // mark mounted once on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // make sure we always work with an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  // find last ASSISTANT message (safe across runtimes)
  useEffect(() => {
    const lastAssistantMessage = [...safeMessages]
      .reverse()
      .find((m) => m.role === "ASSISTANT");
    if (lastAssistantMessage) {
      // TODO: set active fragment
    }
  }, [safeMessages]);

  // auto-scroll when list length changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [safeMessages.length]);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {safeMessages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              // Prisma returns `fragment`; MessageCard expects `fragments`
              fragment={message.fragment ?? null}
              createdAt={new Date(message.createdAt)}
              isActiveFragment={false}
              onFragmentClick={() => {}}
              type={message.type}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="relative p-3 pt-1">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};
