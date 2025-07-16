"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plane, MapPin, Clock, Gauge, CloudSun, Route, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface FlightData {
  status: string
  flightNumber: string
  airline: string
  currentLocation: {
    latitude: number
    longitude: number
    city: string
    region: string
  }
  departure: {
    airport: string
    scheduled: string
    estimated: string
    actual: string
  }
  arrival: {
    airport: string
    scheduled: string
    estimated: string
    actual: string
  }
  altitude: string
  speed: string
  weather: string
  message: string
  lastUpdate: string
  dataAge: string
}

interface RouteSearchResult {
  searchType: string
  departure: string
  arrival: string
  message: string
  availableFlights: Array<{
    callsign: string
    country: string
    latitude: number
    longitude: number
    altitude: number
    velocity: number
  }>
  searchTips: string[]
  suggestion: string
}

interface FlightTrackerProps {
  aircraftModel?: string
}

export function FlightTracker({ aircraftModel }: FlightTrackerProps) {
  const [flightNumber, setFlightNumber] = useState("")
  const [departure, setDeparture] = useState("")
  const [arrival, setArrival] = useState("")
  const [flightData, setFlightData] = useState<FlightData | null>(null)
  const [routeData, setRouteData] = useState<RouteSearchResult | null>(null)
  const [loading, setLoading] = useState(false)

  const trackFlight = async () => {
    if (!flightNumber) {
      toast.error("便名を入力してください（例: JL123, NH456, UA789）")
      return
    }

    setLoading(true)
    setRouteData(null)
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
      toast.success("フライト情報を取得しました")
    } catch (error: any) {
      toast.error(error.message || "フライト情報の取得に失敗しました")
      console.error("Flight tracking error:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchRoute = async () => {
    if (!departure || !arrival) {
      toast.error("出発地と到着地を入力してください（例: 羽田, 新千歳）")
      return
    }

    setLoading(true)
    setFlightData(null)
    try {
      const response = await fetch("/api/flight-tracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departure: departure,
          arrival: arrival,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "ルート検索に失敗しました")
      }

      setRouteData(data)
      toast.success("ルート検索結果を取得しました")
    } catch (error: any) {
      toast.error(error.message || "ルート検索に失敗しました")
      console.error("Route search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectFlight = (callsign: string) => {
    setFlightNumber(callsign)
    // タブを切り替えて便名検索を実行
    trackFlight()
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Plane className="h-5 w-5" />
            フライト追跡システム
          </CardTitle>
          <CardDescription className="text-gray-400">
            便名またはルート（出発地→到着地）でフライト情報を検索
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="flight" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="flight" className="text-white data-[state=active]:bg-gray-600">
                <Plane className="h-4 w-4 mr-2" />
                便名検索
              </TabsTrigger>
              <TabsTrigger value="route" className="text-white data-[state=active]:bg-gray-600">
                <Route className="h-4 w-4 mr-2" />
                ルート検索
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="flight" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="便名を入力 (例: ANA123, JAL456, NH789)"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <Button
                  onClick={trackFlight}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "検索中..." : "フライト追跡"}
                </Button>
              </div>
              {aircraftModel && (
                <p className="text-sm text-gray-400">
                  対象機種: <span className="text-white">{aircraftModel}</span>
                </p>
              )}
              <p className="text-xs text-gray-500">
                🔍 リアルタイムフライト情報を取得します
              </p>
            </TabsContent>
            
            <TabsContent value="route" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="出発地 (例: 羽田, 成田, HND)"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  placeholder="到着地 (例: 新千歳, 伊丹, CTS)"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Button
                onClick={searchRoute}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? "検索中..." : "ルート検索"}
              </Button>
              <p className="text-xs text-gray-500">
                🛫 出発地から到着地への現在のフライトを検索します
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {flightData && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MapPin className="h-5 w-5" />
              フライト詳細: {flightData.flightNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant={flightData.status === "飛行中" ? "default" : "secondary"}
                className="bg-green-600 text-white"
              >
                {flightData.status}
              </Badge>
              <span className="text-gray-400 text-sm">{flightData.airline}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    出発情報
                  </h4>
                  <p className="text-sm text-gray-300">
                    空港: <span className="text-white">{flightData.departure?.airport || "不明"}</span>
                  </p>
                  <p className="text-sm text-gray-300">
                    予定: <span className="text-white">{flightData.departure?.scheduled || "不明"}</span>
                  </p>
                  {flightData.departure?.actual && (
                    <p className="text-sm text-gray-300">
                      実際: <span className="text-white">{flightData.departure.actual}</span>
                    </p>
                  )}
                </div>

                <div className="bg-gray-800 p-3 rounded-lg">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    到着情報
                  </h4>
                  <p className="text-sm text-gray-300">
                    空港: <span className="text-white">{flightData.arrival?.airport || "不明"}</span>
                  </p>
                  <p className="text-sm text-gray-300">
                    予定: <span className="text-white">{flightData.arrival?.scheduled || "不明"}</span>
                  </p>
                  {flightData.arrival?.estimated && (
                    <p className="text-sm text-gray-300">
                      予想: <span className="text-white">{flightData.arrival.estimated}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    現在位置
                  </h4>
                  <p className="text-sm text-gray-300">
                    場所: <span className="text-white">{flightData.currentLocation?.city || "位置取得中"}</span>
                  </p>
                  <p className="text-sm text-gray-300">
                    地域: <span className="text-white">{flightData.currentLocation?.region || "不明"}</span>
                  </p>
                  {flightData.currentLocation?.latitude && flightData.currentLocation?.longitude && (
                    <p className="text-xs text-gray-400">
                      座標: {flightData.currentLocation.latitude.toFixed(4)}, {flightData.currentLocation.longitude.toFixed(4)}
                    </p>
                  )}
                </div>

                <div className="bg-gray-800 p-3 rounded-lg">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    飛行データ
                  </h4>
                  <p className="text-sm text-gray-300">
                    高度: <span className="text-white">{flightData.altitude}</span>
                  </p>
                  <p className="text-sm text-gray-300">
                    速度: <span className="text-white">{flightData.speed}</span>
                  </p>
                  {flightData.lastUpdate && (
                    <p className="text-xs text-gray-400">
                      更新: {flightData.lastUpdate} ({flightData.dataAge})
                    </p>
                  )}
                </div>
              </div>
            </div>

            {flightData.message && (
              <>
                <Separator className="bg-gray-700" />
                <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg">
                  <p className="text-blue-200 text-sm">{flightData.message}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {routeData && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Route className="h-5 w-5" />
              ルート検索結果: {routeData.departure} → {routeData.arrival}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg">
              <p className="text-blue-200 text-sm">{routeData.message}</p>
            </div>

            {routeData.availableFlights && routeData.availableFlights.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-white">現在飛行中のフライト</h4>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {routeData.availableFlights.map((flight, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => selectFlight(flight.callsign)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">{flight.callsign}</p>
                          <p className="text-sm text-gray-400">{flight.country}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-300">
                            高度: {flight.altitude ? Math.round(flight.altitude) : "0"}m
                          </p>
                          <p className="text-sm text-gray-300">
                            速度: {flight.velocity ? Math.round(flight.velocity * 3.6) : "0"}km/h
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {routeData.searchTips && (
              <div className="bg-gray-800 p-3 rounded-lg">
                <h4 className="font-semibold text-white mb-2">検索のヒント</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {routeData.searchTips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {routeData.suggestion && (
              <div className="bg-green-900/20 border border-green-800 p-3 rounded-lg">
                <p className="text-green-200 text-sm">{routeData.suggestion}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
