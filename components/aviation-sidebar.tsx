"use client"

import { Plane, ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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

interface AviationSidebarProps {
  aircraftData: Record<string, Aircraft>
  selectedAircraft: string | null
  onSelectAircraft: (aircraftId: string) => void
}

export function AviationSidebar({ aircraftData, selectedAircraft, onSelectAircraft }: AviationSidebarProps) {
  const boeingAircraft = Object.values(aircraftData).filter((aircraft) => aircraft.manufacturer === "Boeing")
  const airbusAircraft = Object.values(aircraftData).filter((aircraft) => aircraft.manufacturer === "Airbus")

  return (
    <Sidebar className="border-r border-gray-800 bg-black">
      <SidebarHeader className="border-b border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Aviation Hub</h1>
            <p className="text-xs text-gray-400">Aircraft Database</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-black overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-400 font-semibold text-sm px-2 py-2">
            Boeing Aircraft
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {boeingAircraft.map((aircraft) => (
                <SidebarMenuItem key={aircraft.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectAircraft(aircraft.id)}
                    isActive={selectedAircraft === aircraft.id}
                    className="w-full justify-between text-white hover:bg-gray-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white py-2 px-2 min-h-[3rem]"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium text-xs leading-tight">{aircraft.name}</span>
                      <span className="text-xs text-gray-400 leading-tight">{aircraft.maxSpeed}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-red-400 font-semibold text-sm px-2 py-2">
            Airbus Aircraft
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {airbusAircraft.map((aircraft) => (
                <SidebarMenuItem key={aircraft.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectAircraft(aircraft.id)}
                    isActive={selectedAircraft === aircraft.id}
                    className="w-full justify-between text-white hover:bg-gray-800 data-[active=true]:bg-red-600 data-[active=true]:text-white py-2 px-2 min-h-[3rem]"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium text-xs leading-tight">{aircraft.name}</span>
                      <span className="text-xs text-gray-400 leading-tight">{aircraft.maxSpeed}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
