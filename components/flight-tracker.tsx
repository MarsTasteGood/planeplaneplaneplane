"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plane, MapPin, Clock, Gauge, CloudSun } from "lucide-react"
import { toast } from "sonner"

interface FlightData {
  status: string
  currentLocation: {
    latitude: number
    longitude: number
    city: string
    region: string
  }
  origin: string
  destination: string
  altitude: string
  speed: string
  estimatedArrival: string
  weather: string
  message: string
}

interface FlightTrackerProps {
  aircraftModel?: string
}

export function FlightTracker({ aircraftModel }: FlightTrackerProps) {
  const [flightNumber, setFlightNumber] = useState("")
  const [flightData, setFlightData] = useState<FlightData | null>(null)
  const [loading, setLoading] = useState(false)

  const trackFlight = async () => {
    if (!flightNumber) {
      toast.error("便名を入力してください（例: JL123, NH456, UA789）")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/flight-tracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aircraftModel,
          flightNumber: flightNumber.toUpperCase(),
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "フライト情報の取得に失敗しました")
      }

      setFlightData(data)
      toast.success("Google検索からフライト情報を取得しました")
    } catch (error: any) {
      toast.error(error.message || "フライト情報の取得に失敗しました")
      console.error("Flight tracking error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Plane className="h-5 w-5" />
            Google検索フライト追跡
          </CardTitle>
          <CardDescription className="text-gray-400">
            便名を入力してGoogle検索でフライト情報を確認
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="便名を入力 (例: JL123, NH456, UA789)"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
            <Button
              onClick={trackFlight}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "検索中..." : "Google検索で追跡"}
            </Button>
          </div>
          {aircraftModel && (
            <p className="text-sm text-gray-400">
              対象機種: <span className="text-white">{aircraftModel}</span>
            </p>
          )}
          <p className="text-xs text-gray-500">
            🔍 Google検索APIを使用してフライト情報を取得します
          </p>
        </CardContent>
      </Card>

      {flightData && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MapPin className="h-5 w-5" />
              Google検索結果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant={flightData.status === "運航中" ? "default" : "secondary"}
                className="bg-green-600"
              >
                {flightData.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">現在位置</p>
                    <p className="text-white font-medium">
                      {flightData.currentLocation.city}, {flightData.currentLocation.region}
                    </p>
                    <p className="text-xs text-gray-500">
                      {flightData.currentLocation.latitude.toFixed(4)}, {flightData.currentLocation.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">出発地 → 到着地</p>
                    <p className="text-white font-medium">
                      {flightData.origin} → {flightData.destination}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-orange-400" />
                  <div>
                    <p className="text-sm text-gray-400">高度・速度</p>
                    <p className="text-white font-medium">
                      {flightData.altitude} / {flightData.speed}
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">到着予定時刻</p>
                    <p className="text-white font-medium">{flightData.estimatedArrival}</p>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex items-center gap-2">
                  <CloudSun className="h-4 w-4 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">現在地の天気</p>
                    <p className="text-white font-medium">{flightData.weather}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-300">{flightData.message}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
