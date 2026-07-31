import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Printer, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ExportPanel() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Export Reports</CardTitle>
          <CardDescription>Download analytics data for offline viewing</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider delayDuration={200}>
            <div className="flex flex-wrap gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-block">
                    <Button variant="outline" className="gap-2 pointer-events-none opacity-50">
                      <FileSpreadsheet className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Export endpoints not implemented yet</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-block">
                    <Button variant="outline" className="gap-2 pointer-events-none opacity-50">
                      <Download className="h-4 w-4" />
                      Export Excel
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Export endpoints not implemented yet</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-block">
                    <Button variant="outline" className="gap-2 pointer-events-none opacity-50">
                      <FileText className="h-4 w-4" />
                      Export PDF
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Export endpoints not implemented yet</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-block">
                    <Button variant="outline" className="gap-2 pointer-events-none opacity-50">
                      <Printer className="h-4 w-4" />
                      Print Report
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Export endpoints not implemented yet</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </motion.div>
  );
}
