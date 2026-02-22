import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <SignUp 
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
