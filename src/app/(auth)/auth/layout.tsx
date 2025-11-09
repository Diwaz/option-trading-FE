import type React from "react"
import type { Metadata } from "next"
// import { GeistSans } from "geist/font/sans"
// import { GeistMono } from "geist/font/mono"
// import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "../../globals.css"
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "Login",
  description: "100x Trade",
  generator: "100xTrade.xyz",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <Suspense fallback={null}>{children}</Suspense>

      </body>
    </html>
  )
}

