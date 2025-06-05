import RegisterForm from "./registerForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register for an account",
  description:
    "This is the registration page for new users to create an account.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="flex-grow container mx-auto px-4 py-8">
        <RegisterForm />
      </main>
    </div>
  );
}
