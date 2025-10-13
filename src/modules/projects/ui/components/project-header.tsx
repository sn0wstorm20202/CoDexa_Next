import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    SunMoonIcon,
    Settings,
    Share,
    Clock
} from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from  "@/components/ui/dropdown-menu";



interface Props{
    projectId: string;
}


export const ProjectHeader = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const { data : project } = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({ id: projectId })
    );

    const { setTheme, theme} = useTheme();

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <header className="p-3 flex justify-between items-center border-b bg-muted/20">
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="focus-visible:ring-0 hover:bg-accent transition-colors"
                        >
                            <Image src="/logo.svg" alt="codexa" width={16} height={16} />         
                            <span className="text-sm font-medium ml-2">{project.name}</span>
                            <ChevronDownIcon className="ml-1 h-3 w-3" />
                        </Button> 
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start">
                        <DropdownMenuItem asChild>
                            <Link href="/" className="flex items-center gap-2">
                                <ChevronLeftIcon className="h-4 w-4" />
                                <span>Go to Dashboard</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span>Project Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                            <Share className="h-4 w-4 text-muted-foreground" />
                            <span>Share Project</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-2">
                                <SunMoonIcon className="size-4 text-muted-foreground" />
                                <span>Appearance</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                                        <DropdownMenuRadioItem value="light">
                                            <span>Light</span>
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="dark">
                                            <span>Dark</span>
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="system">
                                            <span>System</span>
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Created {formatDate(project.createdAt)}</span>
                </div>
            </div>
        </header>
    );
};