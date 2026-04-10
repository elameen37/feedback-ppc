import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PublicOfficerForm from "./PublicOfficerForm";
import IndividualForm from "./IndividualForm";
import OrganizationalForm from "./OrganizationalForm";

const SelfReportingForms = () => {
  return (
    <section id="self-report" className="py-10 sm:py-16 bg-background" aria-labelledby="self-report-title">
      <div className="container px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-10">
          <h2 id="self-report-title" className="text-2xl md:text-3xl font-bold text-primary mb-3">
            Self-Reporting & Voluntary Disclosure Form
          </h2>
          <p className="text-muted-foreground font-sans">
            Select the appropriate disclosure category below and complete the form. All fields marked with * are required.
          </p>
        </div>

        <Card className="glass-card border-white/5 animate-reveal stagger-1">
          <CardContent className="pt-8">
            <Tabs defaultValue="public-officer" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-8 h-auto p-1.5 bg-muted/50 rounded-xl">
                <TabsTrigger value="public-officer" className="font-sans text-[10px] sm:text-xs md:text-sm py-3 px-1 sm:px-3 rounded-lg data-[state=active]:shadow-lg">
                  Public Officer
                </TabsTrigger>
                <TabsTrigger value="individual" className="font-sans text-[10px] sm:text-xs md:text-sm py-3 px-1 sm:px-3 rounded-lg data-[state=active]:shadow-lg">
                  Individual
                </TabsTrigger>
                <TabsTrigger value="organizational" className="font-sans text-[10px] sm:text-xs md:text-sm py-3 px-1 sm:px-3 rounded-lg data-[state=active]:shadow-lg">
                  Organizational
                </TabsTrigger>
              </TabsList>

              <TabsContent value="public-officer">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg text-primary">Public Officer Disclosure</CardTitle>
                  <CardDescription className="font-sans">
                    Voluntarily disclose misconduct as a public officer seeking corrective compliance.
                  </CardDescription>
                </CardHeader>
                <PublicOfficerForm />
              </TabsContent>

              <TabsContent value="individual">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg text-primary">Individual Voluntary Disclosure</CardTitle>
                  <CardDescription className="font-sans">
                    Disclose your involvement in corruption-related matters. You may submit anonymously.
                  </CardDescription>
                </CardHeader>
                <IndividualForm />
              </TabsContent>

              <TabsContent value="organizational">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg text-primary">Organizational Disclosure</CardTitle>
                  <CardDescription className="font-sans">
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
