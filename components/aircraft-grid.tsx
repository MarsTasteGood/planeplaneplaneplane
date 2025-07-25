import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Users, MapPin, Calendar, Ruler, Zap, Gauge } from "lucide-react"
import { FlightTracker } from "@/components/flight-tracker"

interface Aircraft {
  id: string
  name: string
  manufacturer: string
  maxSpeed: string
  capacity: string
  range: string
  firstFlight: string
  description: string
  specifications: {
    length: string
    wingspan: string
    height: string
    engines: string
  }
  image: string
}

interface AircraftGridProps {
  aircraftData: Record<string, Aircraft>
}

export function AircraftGrid({ aircraftData }: AircraftGridProps) {
  return (
    <div className="p-6 lg:p-8 space-y-16 bg-black">
      {Object.values(aircraftData).map((aircraft) => (
        <div key={aircraft.id} id={aircraft.id} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4">
              <Badge
                className={`${aircraft.manufacturer === "Boeing" ? "bg-blue-600" : "bg-red-600"} text-white px-3 py-1`}
              >
                {aircraft.manufacturer}
              </Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                <Gauge className="h-3 w-3 mr-1" />
                {aircraft.maxSpeed}
              </Badge>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">{aircraft.name}</h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-4xl">{aircraft.description}</p>
          </div>

          {/* Main Image */}
          <div className="relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 mb-8">
            <Image
              src={aircraft.image || "/placeholder.svg"}
              alt={aircraft.name}
              width={1200}
              height={600}
              className="w-full h-[300px] lg:h-[400px] object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-2xl font-bold text-white">{aircraft.name}</h3>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Capacity</p>
                <p className="text-lg font-semibold text-white">{aircraft.capacity}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 text-center">
                <MapPin className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Range</p>
                <p className="text-lg font-semibold text-white">{aircraft.range}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 text-center">
                <Gauge className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Max Speed</p>
                <p className="text-lg font-semibold text-white">{aircraft.maxSpeed}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">First Flight</p>
                <p className="text-lg font-semibold text-white">{aircraft.firstFlight}</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Specifications */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Ruler className="h-6 w-6 text-blue-400" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Length</span>
                    <span className="text-white font-medium">{aircraft.specifications.length}</span>
                  </div>
                  <Separator className="bg-gray-800" />

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Wingspan</span>
                    <span className="text-white font-medium">{aircraft.specifications.wingspan}</span>
                  </div>
                  <Separator className="bg-gray-800" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Height</span>
                    <span className="text-white font-medium">{aircraft.specifications.height}</span>
                  </div>
                  <Separator className="bg-gray-800" />

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Engines
                    </span>
                    <span className="text-white font-medium">{aircraft.specifications.engines}</span>
                  </div>
                  <Separator className="bg-gray-800" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flight Tracker */}
          <FlightTracker aircraftModel={aircraft.name} />
        </div>
      ))}
    </div>
  )
}
