import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: "increase" | "decrease";
    label?: string;
  };
  icon: LucideIcon;
  iconColor?: "primary" | "secondary" | "success" | "warning" | "destructive";
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "primary",
}: StatCardProps) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    success: "text-emerald-500 bg-emerald-500/10",
    warning: "text-amber-500 bg-amber-500/10",
    destructive: "text-destructive bg-destructive/10",
  };

  const changeColorMap = {
    increase: "text-emerald-500",
    decrease: "text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="text-2xl font-medium mt-1">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    "text-sm flex items-center",
                    changeColorMap[change.type]
                  )}
                >
                  {change.type === "increase" ? (
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  )}{" "}
                  {change.value}
                </span>
                {change.label && (
                  <span className="text-text-secondary text-xs ml-2">
                    {change.label}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              colorMap[iconColor]
            )}
          >
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
