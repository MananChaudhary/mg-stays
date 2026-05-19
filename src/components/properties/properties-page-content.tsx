"use client";

import { PropertiesGrid } from "@/components/properties/properties-grid";

type PropertyRow = {
  id: string;
  name: string;
  address: string;
  city: string | null;
  source: string;
  isActive: boolean;
  images: string[];
  _count: { bookings: number };
};

export function PropertiesPageContent({ properties }: { properties: PropertyRow[] }) {
  return <PropertiesGrid properties={properties} />;
}
