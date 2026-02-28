import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function AuthPage() {
  const { user, signIn, signUp } = useAuthContext();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/home" replace />;

  const handleSubmit = async (mode: "login" | "signup") => {
    if (!email || !password) {
      toast({ variant: "destructive", title: "Please fill in all fields" });
      return;
    }
    setLoading(true);
    const { error } = mode === "login" ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else if (mode === "signup") {
      toast({ title: "Check your email", description: "We sent you a confirmation link." });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">Remember</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your voice-powered memory assistant</p>
        </div>

        <Card>
          <CardContent className="p-5">
            <Tabs defaultValue="login">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
              </TabsList>

              {(["login", "signup"] as const).map((mode) => (
                <TabsContent key={mode} value={mode} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button className="w-full" onClick={() => handleSubmit(mode)} disabled={loading}>
                    {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
