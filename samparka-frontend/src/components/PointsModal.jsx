import React from "react";
import { Box, Modal } from "@mui/material";
import { LineChart } from "@mantine/charts";

export default function PointsModal({ open, onClose, analytics, graphData }) {
  // Ensure graphData.pointsGiven is an array before mapping
  const pointsData = Array.isArray(graphData?.pointsGiven)
    ? graphData.pointsGiven.map((item) => ({
        x: item._id, // Adjust based on your actual object structure
        points: item.totalPoints, // Ensure this matches your API response
      }))
    : [];

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-stone-900 p-6 rounded-lg shadow-lg border border-green-400 text-gray-300 w-96">

        <h2 className="text-xl font-semibold text-green-400">Points Details</h2>

        <p className="mt-4">
          Total Points Given Out: {analytics?.totalPointsGivenOut}
        </p>

        {pointsData.length > 0 ? (
          <LineChart
            data={pointsData}
            h={300}
            dataKey="x"
            // xField="x"
            // yField="y"
            curveType="linear"
            // title="Points Given Out"
            className="mt-4"
            series={[
              { name: 'points', color: 'indigo.6' },
            ]}
            // color="teal"
          />
        ) : (
          <p>No data available for the chart</p>
        )}

        <button
          className="mt-6 bg-teal-500 px-4 py-2 rounded hover:bg-teal-600"
          onClick={onClose}
        >
          Close
        </button>
      </Box>
    </Modal>
  );
}
