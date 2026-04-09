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
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Dynamic background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/5 blur-[120px] pointer-events-none" />
      
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
        <Card className="w-full max-w-md glass-panel border-white/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center neon-glow group transition-all duration-500">
              <Shield className="h-8 w-8 text-primary shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </div>
            <CardTitle className="text-2xl text-primary font-bold uppercase tracking-widest animate-neon-glow">Officer Portal</CardTitle>
            <CardDescription className="font-sans text-muted-foreground/70">
              Secure authentication for authorised ICPC personnel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-8 bg-black/40 border border-white/5 p-1 rounded-xl">
                <TabsTrigger value="login" className="font-sans py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:neon-glow transition-all">Sign In</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Officer Email</Label>
                    <Input id="login-email" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="officer@icpc.gov.ng" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all font-sans" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Safe Access Key</Label>
                    <Input id="login-password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all font-sans" />
                  </div>
                  <Button type="submit" className="w-full font-bold font-sans gap-2 h-12 rounded-xl group" disabled={loading}>
                    {loading ? <LogIn className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5 group-hover:scale-110 transition-transform" />} 
                    {loading ? "Authenticating..." : "Authorise & Enter"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
                    <Input id="signup-name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Enter full name" maxLength={100} className="bg-white/5 border-white/10 focus:border-primary/50 transition-all font-sans" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Official Email</Label>
                    <Input id="signup-email" type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="officer@icpc.gov.ng" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all font-sans" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Security Password</Label>
                    <Input id="signup-password" type="password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min 6 characters" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all font-sans" />
                  </div>
                  <Button type="submit" variant="secondary" className="w-full font-bold font-sans h-12 rounded-xl" disabled={loading}>
                    {loading ? "Requesting..." : "Send Access Request"}
                  </Button>
                </form>
                <p className="text-[10px] text-muted-foreground mt-4 font-sans text-center uppercase tracking-widest leading-relaxed">
                  Notice: All registration attempts are logged. <br />Admin approval required for dashboard access.
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
