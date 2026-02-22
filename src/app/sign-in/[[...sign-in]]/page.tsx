import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-pink-600 hover:bg-pink-700",
            card: "bg-gray-900 border border-gray-800",
          }
        }}
      />
    </div>
  );
}
