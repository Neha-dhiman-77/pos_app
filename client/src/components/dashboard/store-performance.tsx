import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStoreSelector } from "@/hooks/use-store-selector";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown } from "lucide-react";

type TimeRange = "7days" | "30days" | "90days" | "year";

export function StorePerformance() {
  const { currentStore } = useStoreSelector();
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  
  // Simulating a query that would get performance data based on time range
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["/api/store/performance", currentStore?.id, timeRange],
    enabled: !!currentStore,
    // Normally we would query this from the API, but for now we'll use static data
  });
  
  // Static data for the chart
  const chartData = [
    { name: "Mon", sales: 3800 },
    { name: "Tue", sales: 3000 },
    { name: "Wed", sales: 2780 },
    { name: "Thu", sales: 1890 },
    { name: "Fri", sales: 2390 },
    { name: "Sat", sales: 3490 },
    { name: "Sun", sales: 2490 },
  ];
  
  // Statistics  
  const stats = [
    { 
      label: "Total Sales", 
      value: "$12,845.50", 
      change: { value: "8.2%", type: "increase" } 
    },
    { 
      label: "Total Orders", 
      value: "342", 
      change: { value: "5.3%", type: "increase" } 
    },
    { 
      label: "Avg. Order Value", 
      value: "$37.56", 
      change: { value: "2.8%", type: "increase" } 
    },
    { 
      label: "Return Rate", 
      value: "1.2%", 
      change: { value: "0.5%", type: "decrease" } 
    },
  ];
  
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">Store Performance</CardTitle>
        <Select defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground text-xs">{stat.label}</p>
              <p className="font-medium text-lg mt-1">{stat.value}</p>
              <p className={`text-xs mt-1 flex items-center ${
                stat.change.type === "increase" 
                  ? "text-emerald-500" 
                  : "text-destructive"
              }`}>
                {stat.change.type === "increase" ? (
                  <ArrowUp className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3" />
                )}
                {stat.change.value} vs prev.
              </p>
            </div>
          ))}
        </div>
        
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                width={500}
                height={200}
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} stroke="#888888" />
                <YAxis fontSize={12} stroke="#888888" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="var(--primary)" 
                  fill="rgba(var(--primary), 0.1)" 
                  name="Sales ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
