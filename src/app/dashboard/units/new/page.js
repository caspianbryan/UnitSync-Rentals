import { Suspense } from "react";
import NewUnitClient from "./NewUnitClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <NewUnitClient />
    </Suspense>
  );
}