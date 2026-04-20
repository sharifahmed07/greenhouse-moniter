"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildChartRows } from "@/lib/readings";
import { formatTimestamp } from "@/lib/time";
import type { HistoryData } from "@/types/dashboard";

const colors = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

export function ChartWrapper({
  title,
  readings,
  metric,
}: {
  title: string;
  readings: HistoryData;
  metric: "temperature" | "humidity";
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const sensors = readings.sensors.map((sensor) => sensor.deviceId);
  const data = useMemo(() => buildChartRows(readings, metric, formatTimestamp), [metric, readings]);

  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const canRenderChart = size.width > 0 && size.height > 0;

  return (
    <div className="min-h-80 min-w-0 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-stone-900">{title}</h2>
      <div ref={chartRef} className="h-64 min-h-64 min-w-0">
        {canRenderChart ? (
          <LineChart width={size.width} height={size.height} data={data}>
            <CartesianGrid stroke="#e7e5e4" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#78716c", fontSize: 12 }} minTickGap={28} />
            <YAxis tick={{ fill: "#78716c", fontSize: 12 }} width={36} />
            <Tooltip
              contentStyle={{
                border: "1px solid #e7e5e4",
                borderRadius: 8,
                boxShadow: "none",
              }}
              labelStyle={{ color: "#44403c" }}
            />
            {sensors.map((sensor, index) => (
              <Line
                key={sensor}
                type="monotone"
                dataKey={sensor}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        ) : null}
      </div>
    </div>
  );
}
