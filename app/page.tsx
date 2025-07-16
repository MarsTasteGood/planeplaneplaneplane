"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AviationSidebar } from "@/components/aviation-sidebar"
import { AircraftGrid } from "@/components/aircraft-grid"
import { Separator } from "@/components/ui/separator"

const aircraftData = {
  // Boeing Aircraft
  "boeing-717": {
    id: "boeing-717",
    name: "Boeing 717-200",
    manufacturer: "Boeing",
    maxSpeed: "438 kts (811 km/h)",
    capacity: "106-134 passengers",
    range: "1,430 nm (2,650 km)",
    firstFlight: "1998",
    description:
      "Originally the McDonnell Douglas MD-95, the Boeing 717 is a twin-engine, single-aisle jet airliner designed for short to medium-haul flights.",
    specifications: {
      length: "37.8 m (124 ft)",
      wingspan: "28.4 m (93.3 ft)",
      height: "8.9 m (29.1 ft)",
      engines: "2× BMW Rolls-Royce BR715",
    },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bq7K7o4QU2Wwz8jGdsw78Sc0RGFY8s.png",
  },
  "boeing-727-200": {
    id: "boeing-727-200",
    name: "Boeing 727-200",
    manufacturer: "Boeing",
    maxSpeed: "521 kts (964 km/h)",
    capacity: "149-189 passengers",
    range: "2,550 nm (4,720 km)",
    firstFlight: "1963",
    description:
      "The Boeing 727 was a pioneering tri-jet aircraft that dominated short to medium-haul routes for decades with its distinctive T-tail design.",
    specifications: {
      length: "46.7 m (153.2 ft)",
      wingspan: "32.9 m (108 ft)",
      height: "10.4 m (34.1 ft)",
      engines: "3× Pratt & Whitney JT8D",
    },
    image: "/images/boeing-727-200-real.png",
  },
  "boeing-737-700": {
    id: "boeing-737-700",
    name: "Boeing 737-700",
    manufacturer: "Boeing",
    maxSpeed: "473 kts (876 km/h)",
    capacity: "126-149 passengers",
    range: "3,365 nm (6,230 km)",
    firstFlight: "1997",
    description:
      "Part of the Next Generation 737 family, the 737-700 offers improved fuel efficiency and modern avionics for short to medium-haul routes.",
    specifications: {
      length: "33.6 m (110.4 ft)",
      wingspan: "35.8 m (117.5 ft)",
      height: "12.5 m (41.2 ft)",
      engines: "2× CFM56-7B",
    },
    image: "/images/boeing-737-700-real.png",
  },
  "boeing-737-800": {
    id: "boeing-737-800",
    name: "Boeing 737-800",
    manufacturer: "Boeing",
    maxSpeed: "473 kts (876 km/h)",
    capacity: "162-189 passengers",
    range: "3,383 nm (6,267 km)",
    firstFlight: "1997",
    description:
      "The most popular variant of the 737 Next Generation family, widely used by airlines worldwide for its reliability and efficiency.",
    specifications: {
      length: "39.5 m (129.5 ft)",
      wingspan: "35.8 m (117.5 ft)",
      height: "12.5 m (41.2 ft)",
      engines: "2× CFM56-7B",
    },
    image: "/images/boeing-737-800-real.png",
  },
  "boeing-737-900": {
    id: "boeing-737-900",
    name: "Boeing 737-900",
    manufacturer: "Boeing",
    maxSpeed: "473 kts (876 km/h)",
    capacity: "177-215 passengers",
    range: "3,200 nm (5,925 km)",
    firstFlight: "2000",
    description:
      "The longest variant of the 737 Next Generation family, offering increased passenger capacity while maintaining operational efficiency.",
    specifications: {
      length: "42.1 m (138.2 ft)",
      wingspan: "35.8 m (117.5 ft)",
      height: "12.5 m (41.2 ft)",
      engines: "2× CFM56-7B",
    },
    image: "/images/boeing-737-900-delta.png",
  },
  "boeing-737-max-7": {
    id: "boeing-737-max-7",
    name: "Boeing 737 MAX 7",
    manufacturer: "Boeing",
    maxSpeed: "473 kts (876 km/h)",
    capacity: "138-153 passengers",
    range: "3,850 nm (7,130 km)",
    firstFlight: "2018",
    description:
      "The smallest variant of the 737 MAX family, designed to replace the 737-700 with improved fuel efficiency and extended range capabilities.",
    specifications: {
      length: "35.6 m (116.8 ft)",
      wingspan: "35.9 m (117.8 ft)",
      height: "12.3 m (40.4 ft)",
      engines: "2× CFM LEAP-1B",
    },
    image: "/images/boeing-737-max-7-boeing.png",
  },
  "boeing-737-max-8": {
    id: "boeing-737-max-8",
    name: "Boeing 737 MAX 8",
    manufacturer: "Boeing",
    maxSpeed: "473 kts (876 km/h)",
    capacity: "162-210 passengers",
    range: "3,550 nm (6,570 km)",
    firstFlight: "2016",
    description:
      "The latest generation of the 737 family featuring new LEAP-1B engines and advanced flight systems for improved fuel efficiency.",
    specifications: {
      length: "39.5 m (129.5 ft)",
      wingspan: "35.9 m (117.8 ft)",
      height: "12.3 m (40.4 ft)",
      engines: "2× CFM LEAP-1B",
    },
    image: "/images/boeing-737-max-8-real.png",
  },
  "boeing-737-max-9": {
    id: "boeing-737-max-9",
    name: "Boeing 737 MAX 9",
    manufacturer: "Boeing",
    maxSpeed: "473 kts (876 km/h)",
    capacity: "178-220 passengers",
    range: "3,550 nm (6,570 km)",
    firstFlight: "2017",
    description:
      "The stretched version of the 737 MAX 8, offering increased capacity with the same fuel-efficient LEAP-1B engines.",
    specifications: {
      length: "42.2 m (138.3 ft)",
      wingspan: "35.9 m (117.8 ft)",
      height: "12.3 m (40.4 ft)",
      engines: "2× CFM LEAP-1B",
    },
    image: "/images/boeing-737-max-9-boeing.png",
  },
  "boeing-737-max-10": {
    id: "boeing-737-max-10",
    name: "Boeing 737 MAX 10",
    manufacturer: "Boeing",
    maxSpeed: "473 kts (876 km/h)",
    capacity: "188-230 passengers",
    range: "3,300 nm (6,110 km)",
    firstFlight: "2021",
    description:
      "The largest variant of the 737 MAX family, offering maximum passenger capacity while maintaining the fuel efficiency and advanced systems of the MAX series.",
    specifications: {
      length: "43.8 m (143.8 ft)",
      wingspan: "35.9 m (117.8 ft)",
      height: "12.3 m (40.4 ft)",
      engines: "2× CFM LEAP-1B",
    },
    image: "/images/boeing-737-max-10-boeing.png",
  },
  "boeing-747-100": {
    id: "boeing-747-100",
    name: "Boeing 747-100",
    manufacturer: "Boeing",
    maxSpeed: "533 kts (988 km/h)",
    capacity: "350-400 passengers",
    range: "5,300 nm (9,800 km)",
    firstFlight: "1969",
    description:
      "The original 'Queen of the Skies' that revolutionized air travel, making long-haul flights accessible to millions with its iconic hump design.",
    specifications: {
      length: "70.6 m (231.7 ft)",
      wingspan: "59.6 m (195.7 ft)",
      height: "19.3 m (63.4 ft)",
      engines: "4× JT9D-7A",
    },
    image: "/images/boeing-747-100-boeing.png",
  },
  "boeing-747-200": {
    id: "boeing-747-200",
    name: "Boeing 747-200",
    manufacturer: "Boeing",
    maxSpeed: "533 kts (988 km/h)",
    capacity: "350-440 passengers",
    range: "6,850 nm (12,690 km)",
    firstFlight: "1970",
    description:
      "The first major improvement to the 747 design, featuring increased fuel capacity and range, becoming the backbone of long-haul aviation for decades.",
    specifications: {
      length: "70.6 m (231.7 ft)",
      wingspan: "59.6 m (195.7 ft)",
      height: "19.3 m (63.4 ft)",
      engines: "4× JT9D-7 or CF6-50",
    },
    image: "/images/boeing-747-200-british-airways.png",
  },
  "boeing-747-300": {
    id: "boeing-747-300",
    name: "Boeing 747-300",
    manufacturer: "Boeing",
    maxSpeed: "533 kts (988 km/h)",
    capacity: "400-496 passengers",
    range: "6,700 nm (12,400 km)",
    firstFlight: "1982",
    description:
      "Featured a stretched upper deck providing 25% more upper deck space, offering airlines increased passenger capacity and cargo flexibility.",
    specifications: {
      length: "70.7 m (231.8 ft)",
      wingspan: "59.6 m (195.7 ft)",
      height: "19.3 m (63.4 ft)",
      engines: "4× JT9D-7R4 or CF6-80C2",
    },
    image: "/images/boeing-747-300-swissair.png",
  },
  "boeing-747-400": {
    id: "boeing-747-400",
    name: "Boeing 747-400",
    manufacturer: "Boeing",
    maxSpeed: "533 kts (988 km/h)",
    capacity: "416-524 passengers",
    range: "7,670 nm (14,205 km)",
    firstFlight: "1988",
    description:
      "The most successful variant of the iconic 'Queen of the Skies', featuring winglets and extended range capabilities.",
    specifications: {
      length: "70.7 m (231.8 ft)",
      wingspan: "64.4 m (211.5 ft)",
      height: "19.4 m (63.6 ft)",
      engines: "4× CF6-80C2 or PW4000",
    },
    image: "/images/boeing-747-400-lufthansa.png",
  },
  "boeing-747-8i": {
    id: "boeing-747-8i",
    name: "Boeing 747-8I",
    manufacturer: "Boeing",
    maxSpeed: "533 kts (988 km/h)",
    capacity: "467-581 passengers",
    range: "8,000 nm (14,816 km)",
    firstFlight: "2010",
    description:
      "The latest and largest variant of the 747, featuring a stretched fuselage and modern GEnx engines for improved efficiency.",
    specifications: {
      length: "76.3 m (250.2 ft)",
      wingspan: "68.4 m (224.4 ft)",
      height: "19.4 m (63.6 ft)",
      engines: "4× GE GEnx-2B67",
    },
    image: "/images/boeing-747-8i-lufthansa.png",
  },
  "boeing-757-200": {
    id: "boeing-757-200",
    name: "Boeing 757-200",
    manufacturer: "Boeing",
    maxSpeed: "530 kts (982 km/h)",
    capacity: "200-239 passengers",
    range: "3,915 nm (7,250 km)",
    firstFlight: "1982",
    description:
      "A narrow-body aircraft known for its powerful engines and ability to operate from short runways and high-altitude airports.",
    specifications: {
      length: "47.3 m (155.3 ft)",
      wingspan: "38.1 m (124.8 ft)",
      height: "13.6 m (44.6 ft)",
      engines: "2× RB211-535 or PW2000",
    },
    image: "/images/boeing-757-200-corporate.png",
  },
  "boeing-767-300": {
    id: "boeing-767-300",
    name: "Boeing 767-300ER",
    manufacturer: "Boeing",
    maxSpeed: "515 kts (954 km/h)",
    capacity: "218-269 passengers",
    range: "5,980 nm (11,070 km)",
    firstFlight: "1986",
    description:
      "An extended-range wide-body aircraft popular for transcontinental and transatlantic routes with twin-aisle comfort.",
    specifications: {
      length: "54.9 m (180.2 ft)",
      wingspan: "47.6 m (156.1 ft)",
      height: "15.8 m (52.0 ft)",
      engines: "2× CF6-80C2 or PW4000",
    },
    image: "/images/boeing-767-300er-jal.png",
  },
  "boeing-777-200": {
    id: "boeing-777-200",
    name: "Boeing 777-200",
    manufacturer: "Boeing",
    maxSpeed: "512 kts (950 km/h)",
    capacity: "314-396 passengers",
    range: "5,240 nm (9,700 km)",
    firstFlight: "1994",
    description:
      "The original variant of Boeing's largest twin-engine aircraft, known for its reliability and passenger comfort.",
    specifications: {
      length: "63.7 m (209.1 ft)",
      wingspan: "60.9 m (199.9 ft)",
      height: "18.5 m (60.9 ft)",
      engines: "2× GE90, PW4000, or Trent 800",
    },
    image: "/images/boeing-777-200-cathay.png",
  },
  "boeing-777-300er": {
    id: "boeing-777-300er",
    name: "Boeing 777-300ER",
    manufacturer: "Boeing",
    maxSpeed: "512 kts (950 km/h)",
    capacity: "365-396 passengers",
    range: "7,370 nm (13,649 km)",
    firstFlight: "2003",
    description:
      "The extended-range version of the 777-300, capable of ultra-long-haul flights with increased fuel capacity.",
    specifications: {
      length: "73.9 m (242.4 ft)",
      wingspan: "64.8 m (212.7 ft)",
      height: "18.6 m (61.0 ft)",
      engines: "2× GE90-115B",
    },
    image: "/images/boeing-777-300er-emirates.png",
  },
  "boeing-777-8": {
    id: "boeing-777-8",
    name: "Boeing 777-8",
    manufacturer: "Boeing",
    maxSpeed: "516 kts (956 km/h)",
    capacity: "384-395 passengers",
    range: "8,730 nm (16,170 km)",
    firstFlight: "2025 (planned)",
    description:
      "The smaller variant of the 777X family, featuring new GE9X engines, composite wings with folding wingtips, and advanced passenger amenities.",
    specifications: {
      length: "69.8 m (229.0 ft)",
      wingspan: "71.8 m (235.5 ft)",
      height: "19.7 m (64.5 ft)",
      engines: "2× GE9X",
    },
    image: "/images/boeing-777-8-boeing.png",
  },
  "boeing-777-9": {
    id: "boeing-777-9",
    name: "Boeing 777-9",
    manufacturer: "Boeing",
    maxSpeed: "516 kts (956 km/h)",
    capacity: "426-440 passengers",
    range: "7,285 nm (13,500 km)",
    firstFlight: "2020",
    description:
      "The larger variant of the 777X family and the world's longest passenger aircraft, featuring revolutionary folding wingtips and the most fuel-efficient twin-aisle airplane.",
    specifications: {
      length: "76.7 m (251.8 ft)",
      wingspan: "71.8 m (235.5 ft)",
      height: "19.7 m (64.5 ft)",
      engines: "2× GE9X",
    },
    image: "/images/boeing-777-9-boeing.png",
  },
  "boeing-787-8": {
    id: "boeing-787-8",
    name: "Boeing 787-8 Dreamliner",
    manufacturer: "Boeing",
    maxSpeed: "515 kts (954 km/h)",
    capacity: "242-290 passengers",
    range: "7,355 nm (13,621 km)",
    firstFlight: "2009",
    description:
      "The first variant of the revolutionary Dreamliner, featuring composite construction and advanced passenger amenities.",
    specifications: {
      length: "56.7 m (186.0 ft)",
      wingspan: "60.1 m (197.0 ft)",
      height: "17.0 m (55.9 ft)",
      engines: "2× GEnx-1B or Trent 1000",
    },
    image: "/images/boeing-787-8-british-airways.png",
  },
  "boeing-787-9": {
    id: "boeing-787-9",
    name: "Boeing 787-9 Dreamliner",
    manufacturer: "Boeing",
    maxSpeed: "515 kts (954 km/h)",
    capacity: "290-330 passengers",
    range: "7,635 nm (14,140 km)",
    firstFlight: "2013",
    description:
      "The stretched version of the 787-8, offering increased capacity while maintaining the Dreamliner's advanced features.",
    specifications: {
      length: "62.8 m (206.0 ft)",
      wingspan: "60.1 m (197.0 ft)",
      height: "17.0 m (55.9 ft)",
      engines: "2× GEnx-1B or Trent 1000",
    },
    image: "/images/boeing-787-9-ana.png",
  },
  "boeing-787-10": {
    id: "boeing-787-10",
    name: "Boeing 787-10 Dreamliner",
    manufacturer: "Boeing",
    maxSpeed: "515 kts (954 km/h)",
    capacity: "330-406 passengers",
    range: "6,430 nm (11,910 km)",
    firstFlight: "2017",
    description:
      "The largest variant of the Dreamliner family, offering maximum passenger capacity with the same advanced technology and comfort.",
    specifications: {
      length: "68.3 m (224.1 ft)",
      wingspan: "60.1 m (197.0 ft)",
      height: "17.0 m (55.9 ft)",
      engines: "2× GEnx-1B or Trent 1000",
    },
    image: "/images/boeing-787-10-united.png",
  },

  // Airbus Aircraft
  "airbus-a318": {
    id: "airbus-a318",
    name: "Airbus 318",
    manufacturer: "Airbus",
    maxSpeed: "467 kts (864 km/h)",
    capacity: "107-132 passengers",
    range: "3,100 nm (5,750 km)",
    firstFlight: "2002",
    description:
      "The smallest member of the A320 family, designed for short-haul routes and smaller airports while maintaining A320 family commonality.",
    specifications: {
      length: "31.4 m (103.1 ft)",
      wingspan: "35.8 m (117.5 ft)",
      height: "12.6 m (41.4 ft)",
      engines: "2× CFM56 or V2500",
    },
    image: "/images/airbus-a318-air-france.jpeg",
  },
  "airbus-a319": {
    id: "airbus-a319",
    name: "Airbus 319",
    manufacturer: "Airbus",
    maxSpeed: "467 kts (864 km/h)",
    capacity: "124-156 passengers",
    range: "3,700 nm (6,850 km)",
    firstFlight: "1995",
    description:
      "A shortened version of the A320, popular with airlines for its versatility on short to medium-haul routes and excellent fuel efficiency.",
    specifications: {
      length: "33.8 m (111.0 ft)",
      wingspan: "35.8 m (117.5 ft)",
      height: "11.8 m (38.7 ft)",
      engines: "2× CFM56 or V2500",
    },
    image: "/images/airbus-a319-united.png",
  },
  "airbus-a320": {
    id: "airbus-a320",
    name: "Airbus 320",
    manufacturer: "Airbus",
    maxSpeed: "467 kts (864 km/h)",
    capacity: "150-180 passengers",
    range: "3,300 nm (6,100 km)",
    firstFlight: "1987",
    description:
      "The pioneering fly-by-wire narrow-body aircraft that revolutionized commercial aviation with its advanced flight control systems.",
    specifications: {
      length: "37.6 m (123.3 ft)",
      wingspan: "35.8 m (117.5 ft)",
      height: "11.8 m (38.7 ft)",
      engines: "2× CFM56 or V2500",
    },
    image: "/images/airbus-a320-airbus.png",
  },
  "airbus-a321": {
    id: "airbus-a321",
    name: "Airbus 321",
    manufacturer: "Airbus",
    maxSpeed: "467 kts (864 km/h)",
    capacity: "185-236 passengers",
    range: "3,200 nm (5,950 km)",
    firstFlight: "1993",
    description:
      "The largest member of the A320 family, offering increased capacity while maintaining commonality with other A320 variants.",
    specifications: {
      length: "44.5 m (146.0 ft)",
      wingspan: "35.8 m (117.5 ft)",
      height: "11.8 m (38.7 ft)",
      engines: "2× CFM56 or V2500",
    },
    image: "/images/airbus-a321-american.png",
  },
  "airbus-a330-200": {
    id: "airbus-a330-200",
    name: "Airbus 330-200",
    manufacturer: "Airbus",
    maxSpeed: "515 kts (954 km/h)",
    capacity: "253-293 passengers",
    range: "7,250 nm (13,430 km)",
    firstFlight: "1997",
    description:
      "The shorter variant of the A330 family, optimized for long-haul routes with excellent fuel efficiency.",
    specifications: {
      length: "58.8 m (192.9 ft)",
      wingspan: "60.3 m (197.8 ft)",
      height: "17.4 m (57.1 ft)",
      engines: "2× CF6-80E, PW4000, or Trent 700",
    },
    image: "/images/airbus-a330-200-turkish.png",
  },
  "airbus-a330-300": {
    id: "airbus-a330-300",
    name: "Airbus 330-300",
    manufacturer: "Airbus",
    maxSpeed: "515 kts (954 km/h)",
    capacity: "277-440 passengers",
    range: "6,350 nm (11,750 km)",
    firstFlight: "1992",
    description:
      "The original and larger variant of the A330, popular for medium to long-haul routes with high passenger capacity.",
    specifications: {
      length: "63.7 m (208.9 ft)",
      wingspan: "60.3 m (197.8 ft)",
      height: "16.8 m (55.2 ft)",
      engines: "2× CF6-80E, PW4000, or Trent 700",
    },
    image: "/images/airbus-a330-300-turkish.jpeg",
  },
  "airbus-a340-300": {
    id: "airbus-a340-300",
    name: "Airbus 340-300",
    manufacturer: "Airbus",
    maxSpeed: "515 kts (954 km/h)",
    capacity: "295-335 passengers",
    range: "7,400 nm (13,700 km)",
    firstFlight: "1991",
    description:
      "A four-engine long-haul aircraft designed for routes where twin-engine operations were restricted, featuring excellent range.",
    specifications: {
      length: "63.7 m (208.9 ft)",
      wingspan: "60.3 m (197.8 ft)",
      height: "16.7 m (54.9 ft)",
      engines: "4× CFM56-5C",
    },
    image: "/images/airbus-a340-300-lufthansa.jpeg",
  },
  "airbus-a340-600": {
    id: "airbus-a340-600",
    name: "Airbus 340-600",
    manufacturer: "Airbus",
    maxSpeed: "515 kts (954 km/h)",
    capacity: "380-419 passengers",
    range: "7,900 nm (14,630 km)",
    firstFlight: "2001",
    description:
      "The longest variant of the A340 family, once the world's longest passenger aircraft with exceptional ultra-long-haul capabilities.",
    specifications: {
      length: "75.4 m (247.4 ft)",
      wingspan: "63.5 m (208.3 ft)",
      height: "17.3 m (56.8 ft)",
      engines: "4× Trent 500",
    },
    image: "/images/airbus-a340-600-lufthansa.png",
  },
  "airbus-a350-900": {
    id: "airbus-a350-900",
    name: "Airbus 350-900",
    manufacturer: "Airbus",
    maxSpeed: "515 kts (954 km/h)",
    capacity: "315-369 passengers",
    range: "8,100 nm (15,000 km)",
    firstFlight: "2013",
    description:
      "The most popular variant of the A350 XWB family, featuring advanced composite materials and fuel-efficient engines.",
    specifications: {
      length: "66.8 m (219.2 ft)",
      wingspan: "64.8 m (212.5 ft)",
      height: "17.1 m (56.0 ft)",
      engines: "2× Trent XWB-84",
    },
    image: "/images/airbus-a350-900-qatar.png",
  },
  "airbus-a350-1000": {
    id: "airbus-a350-1000",
    name: "Airbus 350-1000",
    manufacturer: "Airbus",
    maxSpeed: "515 kts (954 km/h)",
    capacity: "366-410 passengers",
    range: "8,700 nm (16,100 km)",
    firstFlight: "2016",
    description:
      "The largest variant of the A350 XWB family, offering increased capacity and range with the same advanced technology and efficiency.",
    specifications: {
      length: "73.8 m (242.1 ft)",
      wingspan: "64.8 m (212.5 ft)",
      height: "17.1 m (56.0 ft)",
      engines: "2× Trent XWB-97",
    },
    image: "/images/airbus-a350-1000-cathay.png",
  },
  "airbus-a380": {
    id: "airbus-a380",
    name: "Airbus 380-800",
    manufacturer: "Airbus",
    maxSpeed: "550 kts (1,020 km/h)",
    capacity: "525-853 passengers",
    range: "8,000 nm (14,800 km)",
    firstFlight: "2005",
    description:
      "The world's largest passenger airliner, featuring a full-length double-deck design and unmatched passenger capacity.",
    specifications: {
      length: "72.7 m (238.6 ft)",
      wingspan: "79.8 m (261.8 ft)",
      height: "24.1 m (79.1 ft)",
      engines: "4× GP7200 or Trent 900",
    },
    image: "/images/airbus-a380-emirates.png",
  },
}

export default function AviationWebsite() {
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null)

  const scrollToAircraft = (aircraftId: string) => {
    const element = document.getElementById(aircraftId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setSelectedAircraft(aircraftId)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const aircraftElements = Object.keys(aircraftData)
        .map((id) => ({
          id,
          element: document.getElementById(id),
        }))
        .filter((item) => item.element)

      for (const { id, element } of aircraftElements) {
        const rect = element!.getBoundingClientRect()
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
          setSelectedAircraft(id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <SidebarProvider defaultOpen={true}>
        <AviationSidebar
          aircraftData={aircraftData}
          selectedAircraft={selectedAircraft}
          onSelectAircraft={scrollToAircraft}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-800 px-4 bg-black/95 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="-ml-1 text-white hover:bg-gray-800" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-gray-600" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white">Aviation Encyclopedia</h1>
              <p className="text-sm text-gray-400">Complete Boeing & Airbus Aircraft Database</p>
            </div>
          </header>
          <AircraftGrid aircraftData={aircraftData} />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
