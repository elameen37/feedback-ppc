import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PublicOfficerForm from "./PublicOfficerForm";
import IndividualForm from "./IndividualForm";
import OrganizationalForm from "./OrganizationalForm";

const SelfReportingForms = () => {
  return (
    <section id="self-report" className="py-10 sm:py-20 bg-background relative overflow-hidden" aria-labelledby="self-report-title">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)] pointer-events-none" />
      <div className="container px-4 sm:px-6 max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <h2 id="self-report-title" className="text-2xl md:text-3xl font-bold text-primary mb-3 uppercase tracking-widest animate-neon-glow">
            Self-Reporting & Voluntary Disclosure
          </h2>
          <p className="text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
            Select the appropriate disclosure category below and complete the form. All information is secured using government-grade encryption.
          </p>
        </div>

        <Card className="glass-panel border-white/5 shadow-2x overflow-hidden">
          <CardContent className="pt-6">
            <Tabs defaultValue="public-officer" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-8 h-auto bg-black/40 border border-white/5 p-1 rounded-xl">
                <TabsTrigger value="public-officer" className="font-sans text-[10px] sm:text-xs md:text-sm py-3 px-1 sm:px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:neon-glow transition-all">
                  Public Officer
                </TabsTrigger>
                <TabsTrigger value="individual" className="font-sans text-[10px] sm:text-xs md:text-sm py-3 px-1 sm:px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:neon-glow transition-all">
                  Individual
                </TabsTrigger>
                <TabsTrigger value="organizational" className="font-sans text-[10px] sm:text-xs md:text-sm py-3 px-1 sm:px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:neon-glow transition-all">
                  Organizational
                </TabsTrigger>
              </TabsList>

              <TabsContent value="public-officer" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl text-primary">Public Officer Disclosure</CardTitle>
                  <CardDescription className="font-sans text-muted-foreground/80">
                    Voluntarily disclose misconduct as a public officer seeking corrective compliance.
                  </CardDescription>
                </CardHeader>
                <PublicOfficerForm />
              </TabsContent>

              <TabsContent value="individual" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl text-primary">Individual Voluntary Disclosure</CardTitle>
                  <CardDescription className="font-sans text-muted-foreground/80">
                    Disclose your involvement in corruption-related matters. You may submit anonymously.
                  </CardDescription>
                </CardHeader>
                <IndividualForm />
              </TabsContent>

              <TabsContent value="organizational" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl text-primary">Organizational Disclosure</CardTitle>
                  <CardDescription className="font-sans text-muted-foreground/80">
                    Report internal irregularities identified within your organization.
                  </CardDescription>
                </CardHeader>
                <OrganizationalForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SelfReportingForms;
