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
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        
        <div className="container max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl glass-card border-white/10 shadow-2xl animate-reveal">
          {/* Left Panel: Branding / Mission */}
          <div className="hidden lg:flex flex-col justify-center p-12 bg-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-50" />
            
            <div className="relative z-10 space-y-8">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Official <br /> Authority Portal</h2>
                <div className="h-1 w-12 bg-accent rounded-full mb-6" />
                <p className="text-primary-foreground/80 font-sans leading-relaxed text-lg">
                  Access the centralized command center for corruption investigation and 
                  misconduct tracking. Your integrity is the shield of the nation.
                </p>
              </div>
              <ul className="space-y-4 text-sm font-sans text-primary-foreground/60">
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Secure end-to-end encrypted sessions
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Real-time investigation audit logs
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Administrative oversight & dispatch
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel: Auth Form */}
          <div className="p-8 sm:p-12 flex flex-col justify-center bg-background/40 backdrop-blur-sm">
            <div className="mb-8 lg:hidden text-center">
               <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
               <h2 className="text-2xl font-bold text-primary">Officer Portal</h2>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-8 bg-black/5 p-1 rounded-xl">
                <TabsTrigger value="login" className="font-sans py-2.5 rounded-lg data-[state=active]:glass-card">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="font-sans py-2.5 rounded-lg data-[state=active]:glass-card">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6 animate-reveal">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-primary mb-1">Welcome back</h3>
                  <p className="text-sm text-muted-foreground font-sans">Authorized personnel only.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2 group">
                    <Label htmlFor="login-email" className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                    <Input id="login-email" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="officer@icpc.gov.ng" className="glass-card border-white/5 focus-visible:ring-accent" />
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="login-password" className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Security Password</Label>
                    <Input id="login-password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="glass-card border-white/5 focus-visible:ring-accent" />
                  </div>
                  <Button type="submit" className="w-full font-sans gap-2 py-6 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 mt-4" disabled={loading}>
                    {loading ? "Verifying..." : (<><LogIn className="h-5 w-5" /> Sign In</>)}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6 animate-reveal">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-primary mb-1">New Enrollment</h3>
                  <p className="text-sm text-muted-foreground font-sans">Submit credentials for approval.</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Full Name</Label>
                    <Input id="signup-name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Enter full name" className="glass-card border-white/5 focus-visible:ring-accent" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Government Email</Label>
                    <Input id="signup-email" type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="officer@icpc.gov.ng" className="glass-card border-white/5 focus-visible:ring-accent" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Secret Password</Label>
                    <Input id="signup-password" type="password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min 6 characters" className="glass-card border-white/5 focus-visible:ring-accent" />
                  </div>
                  <Button type="submit" className="w-full font-sans py-6 text-lg bg-primary hover:bg-primary/90 mt-4" disabled={loading}>
                    {loading ? "Processing..." : "Create Authority Account"}
                  </Button>
                </form>
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-600 font-sans uppercase tracking-widest text-center mt-4">
                  System: Access granted only after high-level verification.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
