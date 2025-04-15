import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"

export function RequestsSummary() {
  // Mock data - in a real app, this would come from API
  const summaryData = [
    {
      title: "Total Requests",
      value: "12",
      icon: FileText,
      description: "All time",
    },
    {
      title: "Pending",
      value: "3",
      icon: Clock,
      description: "Awaiting approval",
    },
    {
      title: "Approved",
      value: "8",
      icon: CheckCircle,
      description: "Ready for processing",
    },
    {
      title: "Recaps Needed",
      value: "1",
      icon: AlertCircle,
      description: "Action required",
      alert: true,
    },
  ]

  return (
    <>
      {summaryData.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.alert ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
