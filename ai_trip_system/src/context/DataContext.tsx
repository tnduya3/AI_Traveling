"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Import the TripPlan type from backend types
// Import the response type from our API
interface TripGenerateResponse {
  idAIRec: string;
  recommendation: string;
  ai_service?: string;
  generated_at?: string;
  request_summary?: string;
}

interface DataContextType {
  data: TripPlan | TripGenerateResponse | null;
  setData: (data: TripPlan | TripGenerateResponse | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [data, setData] = useState<TripPlan | TripGenerateResponse | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tripPlan");
      if (stored) {
        setData(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (data) {
        localStorage.setItem("tripPlan", JSON.stringify(data));
      } else {
        localStorage.removeItem("tripPlan");
      }
    }
  }, [data]);
  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
