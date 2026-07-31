import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import { VolunteerLeaderboardEntry } from "../../types";
import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface VolunteerLeaderboardProps {
  data: VolunteerLeaderboardEntry[];
  isLoading?: boolean;
}

export function VolunteerLeaderboard({ data, isLoading }: VolunteerLeaderboardProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground ml-1">{index + 1}</span>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
      <Card className="h-full shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Volunteer Leaderboard</CardTitle>
          <CardDescription>Top performers by collection amount</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 mt-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No volunteer data available.
            </div>
          ) : (
            <div className="mt-2 border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[60px] text-center">Rank</TableHead>
                    <TableHead>Volunteer Name</TableHead>
                    <TableHead className="text-right">Donations</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 10).map((volunteer, index) => (
                    <TableRow key={volunteer.id} className="hover:bg-muted/30">
                      <TableCell className="text-center">
                        <div className="flex justify-center">{getRankIcon(index)}</div>
                      </TableCell>
                      <TableCell className="font-medium">{volunteer.name}</TableCell>
                      <TableCell className="text-right">{volunteer.count}</TableCell>
                      <TableCell className="text-right text-muted-foreground hidden sm:table-cell">
                        {formatCurrency(volunteer.average)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(volunteer.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
