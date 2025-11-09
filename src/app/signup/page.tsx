
import Link from "next/link"
import AuthForm from "@/components/auth/auth-form"

export default function SignUpPage() {
  return (
    <main className="min-h-dvh  bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AuthForm
          mode="sign-up"
          title="Create account"
          subtitle="Start trading in minutes"
          footer={
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          }
        />
      </div>
    </main>
  )
}
