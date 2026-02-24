import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, negative }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-gray-500">{title}</p>
        <p
          className={`text-2xl font-bold ${negative ? "text-red-600" : ""
            }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
