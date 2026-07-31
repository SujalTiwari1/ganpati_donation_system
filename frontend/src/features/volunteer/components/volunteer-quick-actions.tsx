import { Link } from "@tanstack/react-router";
import { Building2, ClipboardList, Plus, User } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QUICK_ACTIONS = [
  { label: "Collect Donation", to: "/transactions/new", icon: Plus },
  { label: "View Buildings", to: "/buildings", icon: Building2 },
  { label: "My Donations", to: "/transactions", icon: ClipboardList },
  { label: "Profile", to: "/profile", icon: User },
];

export function VolunteerQuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15, ease: "easeOut" }}
    >
      <Card className="card-elevated rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 + i * 0.05 }}
            >
              <Button
                asChild
                variant="outline"
                className="h-auto flex-col gap-2 py-4 active:scale-95"
              >
                <Link to={action.to}>
                  <action.icon className="size-5 text-primary" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
