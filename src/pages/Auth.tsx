import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/icpc/Header";
import Footer from "@/components/icpc/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Shield, LogIn } from "lucide-react";

const AuthPage = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back", description: "Redirecting to dashboard..." });
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setLoading(false);
    if (error) {
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account Created", description: "Please check your email to verify your account before signing in." });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl text-primary">Officer / Admin Portal</CardTitle>
            <CardDescription className="font-sans">
              Sign in to access the ICPC complaint management dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="login" className="font-sans">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="font-sans">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-sans">Email</Label>
                    <Input id="login-email" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="officer@icpc.gov.ng" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-sans">Password</Label>
                    <Input id="login-password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <Button type="submit" className="w-full font-sans gap-2" disabled={loading}>
                    <LogIn className="h-4 w-4" /> {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="font-sans">Full Name</Label>
                    <Input id="signup-name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Full name" maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-sans">Email</Label>
                    <Input id="signup-email" type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="officer@icpc.gov.ng" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-sans">Password</Label>
                    <Input id="signup-password" type="password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min 6 characters" />
                  </div>
                  <Button type="submit" className="w-full font-sans" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-3 font-sans text-center">
                  Note: New accounts require admin approval for role assignment.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
