import { ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

interface ChartWrapperProps {
  children: ReactElement;
  height?: number;
}

export default function ChartWrapper({
  children,
  height = 200,
}: ChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  );
}
