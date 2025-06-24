import React, { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Načítám...</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
