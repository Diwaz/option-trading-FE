
import Link from "next/link"
import AuthForm from "@/components/auth/auth-form"

export default function SignInPage() {
  return (
    <main className="min-h-dvh  bg-background text-foreground flex items-center justify-center p-6">

      <div className="w-full max-w-md">
        <AuthForm
          mode="sign-in"
          title="Sign in"
          subtitle="Access your account"
          footer={
            <p className="text-sm text-muted-foreground">
              Don{"'"}t have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          }
        />
      </div>
    </main>
  )
}
