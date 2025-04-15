"use client"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function RequestsChart() {
  // Mock data - in a real app, this would come from API
  const data = [
    {
      name: "Administrative",
      "Petty Cash": 450,
      Requisition: 0,
    },
    {
      name: "Programs",
      "Petty Cash": 0,
      Requisition: 1200,
    },
    {
      name: "Monitoring",
      "Petty Cash": 320,
      Requisition: 0,
    },
    {
      name: "Executive",
      "Petty Cash": 0,
      Requisition: 2500,
    },
    {
      name: "Finance",
      "Petty Cash": 180,
      Requisition: 0,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Petty Cash" fill="#8884d8" />
        <Bar dataKey="Requisition" fill="#82ca9d" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
