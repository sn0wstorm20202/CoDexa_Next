import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TRPCReactProvider } from "@/trpc/client"
import { ReactQueryProvider } from '@/components/ReactQueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Codexa - AI-Powered App Builder',
    description: 'Create stunning apps & websites by chatting with AI.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <TRPCReactProvider>
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning={true}>
                <ReactQueryProvider>
                    <TooltipProvider>
                        <Toaster />
                        {children}
                    </TooltipProvider>
                </ReactQueryProvider>
            </body>
        </html>
        </TRPCReactProvider>
    )
} 