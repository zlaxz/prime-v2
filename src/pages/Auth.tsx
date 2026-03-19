import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Account created! Check your email to confirm.");
      } else {
        await signIn(email, password);
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden"
         style={{ backgroundColor: "var(--arc-reactor-bg)" }}>
      {/* Arc reactor background glow */}
      <div className="arc-reactor-glow pointer-events-none absolute inset-0" />

      <div className="relative z-10 w-full max-w-sm space-y-8 p-6">
        <div className="text-center">
          <h1 className="arc-reactor-glow-text text-5xl font-bold tracking-wider">
            PRIME
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--arc-reactor-text-secondary)" }}>
            Your ADHD command center
          </p>
        </div>

        <Button
          onClick={() => signInWithGoogle()}
          className="arc-reactor-button w-full rounded-lg py-5"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: "rgba(0, 217, 255, 0.2)" }} />
          <span className="text-xs" style={{ color: "var(--arc-reactor-text-secondary)" }}>or</span>
          <div className="h-px flex-1" style={{ backgroundColor: "rgba(0, 217, 255, 0.2)" }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="arc-reactor-input rounded-lg"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="arc-reactor-input rounded-lg"
            required
            minLength={6}
          />
          <Button
            type="submit"
            className="arc-reactor-button w-full rounded-lg py-5"
            disabled={loading}
          >
            {loading ? "..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm" style={{ color: "var(--arc-reactor-text-secondary)" }}>
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="transition-colors hover:text-[var(--arc-reactor-accent)]"
            style={{ color: "hsl(187 100% 50%)" }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
