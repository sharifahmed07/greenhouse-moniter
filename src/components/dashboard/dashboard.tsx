"use client";

import { useEffect, useState } from "react";
import { formatRelativeSeconds, formatTemperature, formatTime } from "@/lib/time";
import type { DashboardData, HistoryData } from "@/types/dashboard";
import { ChartWrapper } from "@/components/dashboard/chart-wrapper";
import { Card } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import { ReadingTable } from "@/components/ui/reading-table";
import { StatusBadge } from "@/components/ui/status-badge";

export function Dashboard({
  initialDashboard,
  initialHistory,
}: {
  initialDashboard: DashboardData;
  initialHistory: HistoryData;
}) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [history, setHistory] = useState(initialHistory);
  const [pollingError, setPollingError] = useState(false);

  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;

    async function refresh() {
      try {
        const [dashboardResponse, historyResponse] = await Promise.all([
          fetch("/api/dashboard", { cache: "no-store" }),
          fetch("/api/history", { cache: "no-store" }),
        ]);

        if (!dashboardResponse.ok || !historyResponse.ok) {
          throw new Error("Polling failed");
        }

        const nextDashboard: DashboardData = await dashboardResponse.json();
        const nextHistory: HistoryData = await historyResponse.json();

        if (active) {
          setDashboard(nextDashboard);
          setHistory(nextHistory);
          setPollingError(false);
        }
      } catch {
        if (active) {
          setPollingError(true);
        }
      } finally {
        if (active) {
          timeoutId = window.setTimeout(refresh, 5000);
        }
      }
    }

    timeoutId = window.setTimeout(refresh, 5000);

    return () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  if (dashboard.counts.total === 0) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10">
        <Card className="w-full text-center">
          <h1 className="text-xl font-semibold text-stone-900">Greenhouse Monitor</h1>
          <p className="mt-3 text-stone-500">
            No sensor data yet. Waiting for incoming readings...
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500">Greenhouse Monitor</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-950">
            Sensor health
          </h1>
        </div>
        <LastUpdated key={dashboard.generatedAt} generatedAt={dashboard.generatedAt} />
      </header>

      {pollingError ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Connection lost. Retrying...
        </div>
      ) : null}

      <section className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Metric label="Total sensors" value={dashboard.counts.total} />
        <Metric label="Normal" value={dashboard.counts.normal} tone="normal" />
        <Metric label="Warning" value={dashboard.counts.warning} tone="warning" />
        <Metric label="Critical" value={dashboard.counts.critical} tone="critical" />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboard.sensors.map((sensor) => {
          const latest = sensor.latestReading;

          return (
            <Card key={sensor.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-stone-950">{sensor.deviceId}</h2>
                  <p className="mt-1 text-sm text-stone-500">{sensor.location}</p>
                </div>
                <StatusBadge value={latest?.severity ?? "unknown"} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-stone-500">Temperature</p>
                  <p className="mt-1 text-xl font-semibold text-stone-900">
                    {latest ? formatTemperature(latest.temperature) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Humidity</p>
                  <p className="mt-1 text-xl font-semibold text-stone-900">
                    {latest ? `${latest.humidity.toFixed(1)}%` : "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
                <span className="text-stone-500">
                  {formatRelativeSeconds(sensor.lastSeenAt, dashboard.generatedAt)}
                </span>
                <StatusBadge value={sensor.connectionStatus} />
              </div>
            </Card>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h2 className="text-sm font-semibold text-stone-900">Recent alerts</h2>
          {dashboard.recentAlerts.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">No warning or critical readings.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {dashboard.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-900">{alert.deviceId}</p>
                    <p className="text-sm text-stone-500">
                      {alert.location} at {formatTime(alert.recordedAt)}
                    </p>
                  </div>
                  <StatusBadge value={alert.severity} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid gap-6">
          <ChartWrapper title="Temperature trend" readings={history} metric="temperature" />
          <ChartWrapper title="Humidity trend" readings={history} metric="humidity" />
        </div>
      </section>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-900">Recent readings</h2>
        <ReadingTable readings={dashboard.recentReadings} />
      </Card>
    </main>
  );
}

function LastUpdated({ generatedAt }: { generatedAt: number }) {
  const [now, setNow] = useState(generatedAt);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [generatedAt]);

  const dataIsStale = now - generatedAt > 10000;

  return (
    <div className="text-sm">
      <p className={dataIsStale ? "font-medium text-amber-700" : "text-stone-500"}>
        Last updated {formatRelativeSeconds(new Date(generatedAt).toISOString(), now)}
      </p>
      {dataIsStale ? <p className="mt-1 text-amber-700">Data may be stale</p> : null}
    </div>
  );
}
