import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import api from "../api/config";
import { toast } from "sonner";

const fetchVotes = async () => {
  const res = await api.get("/vote");
  return res.data;
};

const Result = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["votes"],
    queryFn: fetchVotes,
    refetchInterval: 3000, // Refetch every 5 seconds
  });

  if (isLoading)
    return (
      <div className="h-screen flex justify-center items-center text-lg font-semibold">
        Loading live results...
      </div>
    );
  if (isError)
    return (
      <div className="h-screen flex justify-center items-center text-lg font-semibold text-red-500">
        Error fetching vote data.
      </div>
    );

  // Transform data if needed
  const chartData = data.map((contestant) => ({
    name: contestant.contestantName,
    votes: contestant.vote,
  }));

  return (
    <div className="min-h-screen p-4 bg-white text-black flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-center mb-6">
        📊 Live Voting Results
      </h1>
      <div className="max-w-4xl mx-auto w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="votes" fill="#8884d8" barSize={30}>
              <LabelList dataKey="votes" position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Result;
