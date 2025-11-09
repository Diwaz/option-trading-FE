"use client";

import { useState } from "react";
import { Email } from "@/components/auth/Email";
import { Otp } from "@/components/auth/Otp";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email");
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      {step === "email" && (
        <Email setEmail={setEmail} setStep={setStep} email={email} />
      )}
      {step === "otp" && <Otp email={email} setStep={setStep} />}
    </div>
  );
}

export default LoginPage;