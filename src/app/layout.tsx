import type React from "react"
import type { Metadata } from "next"
// import { GeistSans } from "geist/font/sans"
import { Geist_Mono } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
// import AuthStatus from "@/components/auth/auth-status"
import Navbar from "@/components/navbar/nav"
import { Toaster } from "sonner";
import { headers } from "next/headers"

const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "100xTrade",
  description: "Trade with infinite Leverage",
  generator: "100xTrade.xyz",
}

 const headersList = await headers()
  const pathname = headersList.get('x-pathname')
  console.log("pathname",pathname)

const hideNavbar = pathname?.startsWith("/auth")
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en" className="dark ">
      <body className={_geistMono.className}>
        {!hideNavbar && <Navbar/>}
        <Toaster
       toastOptions={{
    style: {
      color:'#0f172a',
    },
  }} 
        />
        <Suspense fallback={null}>{children}</Suspense>

      </body>
    </html>
  )
}
