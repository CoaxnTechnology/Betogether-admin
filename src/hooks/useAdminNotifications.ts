import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import client from "@/api/client";

interface NotificationSummary {
  urgent: number;
  standard: number;
  total: number;
}

const POLL_INTERVAL_MS = 60000;

// Shared, app-level poll for the sidebar badge + urgent-report toast — mounted
// once in Layout so it works no matter which page the admin is currently on,
// instead of every page re-implementing its own polling.
export function useAdminNotifications() {
  const [summary, setSummary] = useState<NotificationSummary>({
    urgent: 0,
    standard: 0,
    total: 0,
  });
  const prevUrgentRef = useRef(0);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await client.get("/notifications/summary");
        const data: NotificationSummary = res.data?.data || {
          urgent: 0,
          standard: 0,
          total: 0,
        };
        if (cancelled) return;

        if (!firstLoadRef.current && data.urgent > prevUrgentRef.current) {
          toast.error("🔴 New urgent report received", { duration: 6000 });
        }
        firstLoadRef.current = false;
        prevUrgentRef.current = data.urgent;
        setSummary(data);
      } catch {
        // Silent — badge just won't update this cycle (e.g. logged out).
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return summary;
}
