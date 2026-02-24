"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RentCards({ rents }) {
  if (!rents || rents.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No rent records yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {rents.map((r) => (
        <Card key={r._id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{r.month}</span>
              <Badge
                variant={
                  r.status === "paid"
                    ? "success"
                    : r.status === "partial"
                      ? "warning"
                      : "destructive"
                }
              >
                {r.status}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="text-sm space-y-1">
            <p>
              <span className="text-gray-500">Paid:</span>{" "}
              <strong>KES {r.amountPaid}</strong>
            </p>
            <p>
              <span className="text-gray-500">Due:</span>{" "}
              <strong>KES {r.amountDue}</strong>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
