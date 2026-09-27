"use client";

import { DatabaseIcon, ServerIcon } from "lucide-react";

import { StatusRow } from "@/components/status-row";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useHealth } from "../api/get-health";

/**
 * API and database status. Pass extra <StatusRow>s as children to add checks from other
 * features without changing this component.
 */
export function SystemStatusCard({
  description = "Refreshes every 30 seconds.",
  className,
  children,
}: {
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { data, isLoading, isError } = useHealth();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>System status</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        <StatusRow
          icon={<ServerIcon />}
          label="API"
          tone={isLoading ? "pending" : isError ? "error" : "ok"}
          value={isLoading ? "Checking…" : isError ? "Unreachable" : "Online"}
        />
        <StatusRow
          icon={<DatabaseIcon />}
          label="Database"
          tone={isLoading ? "pending" : data?.database ? "ok" : "error"}
          value={isLoading ? "Checking…" : data?.database ? "Connected" : "Down"}
        />
        {children}
      </CardContent>
    </Card>
  );
}
