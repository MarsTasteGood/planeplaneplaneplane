import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// 複数のAPIを使用してより詳細なフライト情報を取得する関数
async function getComprehensiveFlightData(flightNumber: string) {
  // まずOpenSkyからリアルタイム位置データを取得
  const openSkyData = await getOpenSkyFlightData(flightNumber)
  
  // AviationStack APIからスケジュール情報を取得
  const aviationStackData = await getAviationStackData(flightNumber)
  
  // FlightLabs APIからフライト詳細を取得
  const flightLabsData = await getFlightLabsData(flightNumber)
  
  // データを統合
  return {
    realtime: openSkyData,
    schedule: aviationStackData,
    details: flightLabsData
  }
}

// AviationStack APIからフライト情報を取得
async function getAviationStackData(flightNumber: string) {
  try {
    const apiKey = process.env.AVIATIONSTACK_API_KEY
    if (!apiKey) {
      console.log('AviationStack API key not configured')
      return null
    }
    
    const response = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FlightTracker/1.0)'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`AviationStack API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      const flight = data.data[0]
      return {
        source: 'aviationstack',
        flight_number: flight.flight?.iata,
        airline: flight.airline?.name,
        aircraft: flight.aircraft?.registration,
        departure: {
          airport: flight.departure?.airport,
          scheduled: flight.departure?.scheduled,
          estimated: flight.departure?.estimated,
          actual: flight.departure?.actual,
          terminal: flight.departure?.terminal,
          gate: flight.departure?.gate
        },
        arrival: {
          airport: flight.arrival?.airport,
          scheduled: flight.arrival?.scheduled,
          estimated: flight.arrival?.estimated,
          actual: flight.arrival?.actual,
          terminal: flight.arrival?.terminal,
          gate: flight.arrival?.gate
        },
        status: flight.flight_status
      }
    }
    
    return null
  } catch (error) {
    console.error('AviationStack API error:', error)
    return null
  }
}

// FlightLabs APIからフライト情報を取得
async function getFlightLabsData(flightNumber: string) {
  try {
    const apiKey = process.env.FLIGHTLABS_API_KEY
    if (!apiKey) {
      console.log('FlightLabs API key not configured')
      return null
    }
    
    const response = await fetch(
      `https://app.goflightlabs.com/flights?access_key=${apiKey}&flight_iata=${flightNumber}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FlightTracker/1.0)'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`FlightLabs API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      const flight = data.data[0]
      return {
        source: 'flightlabs',
        flight_number: flight.flight_number,
        airline: flight.airline?.name,
        aircraft: {
          model: flight.aircraft?.model,
          registration: flight.aircraft?.registration
        },
        route: flight.route,
        status: flight.status
      }
    }
    
    return null
  } catch (error) {
    console.error('FlightLabs API error:', error)
    return null
  }
}

// OpenSky Network APIを使用してリアルタイムフライトデータを取得する関数
async function getOpenSkyFlightData(flightNumber: string) {
  try {
    console.log(`🔍 Searching for flight: ${flightNumber}`)
    
    // まず全てのフライトを取得してフライト番号で検索
    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FlightTracker/1.0)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`OpenSky API request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.states || data.states.length === 0) {
      console.log('❌ No flight data available from OpenSky')
      return null
    }
    
    console.log(`📊 Total flights available: ${data.states.length}`)
    
    // より柔軟な検索パターンを作成
    const searchPatterns = [
      flightNumber.toUpperCase().trim(),
      flightNumber.toLowerCase().trim(),
      flightNumber.replace(/\s+/g, ''),
      // 数字を4桁にパディング (JAL123 -> JAL0123)
      flightNumber.replace(/([A-Za-z]+)(\d+)/, (match, prefix, number) => 
        `${prefix.toUpperCase()}${number.padStart(4, '0')}`
      ),
      // 逆パターンもチェック (JAL0123 -> JAL123)
      flightNumber.replace(/([A-Za-z]+)0+(\d+)/, (match, prefix, number) => 
        `${prefix.toUpperCase()}${number}`
      )
    ]
    
    console.log(`🔍 Search patterns: ${searchPatterns.join(', ')}`)
    
    // フライト番号で検索（複数パターンを試行）
    let matchingFlight = null
    
    for (const pattern of searchPatterns) {
      matchingFlight = data.states.find((state: any[]) => {
        const callsign = state[1]?.trim()
        if (!callsign) return false
        
        const cleanCallsign = callsign.replace(/\s+/g, '')
        const cleanPattern = pattern.replace(/\s+/g, '')
        
        return cleanCallsign === cleanPattern ||
               cleanCallsign.includes(cleanPattern) ||
               cleanPattern.includes(cleanCallsign)
      })
      
      if (matchingFlight) {
        console.log(`✅ Found flight with pattern "${pattern}": ${matchingFlight[1]}`)
        break
      }
    }
    
    if (!matchingFlight) {
      console.log('❌ No matching flight found')
      return null
    }
    
    // 最初にマッチしたフライトを使用
    const flight = matchingFlight
    
    return {
      source: 'opensky',
      callsign: flight[1]?.trim(),
      origin_country: flight[2],
      time_position: flight[3],
      last_contact: flight[4],
      longitude: flight[5],
      latitude: flight[6],
      baro_altitude: flight[7],
      on_ground: flight[8],
      velocity: flight[9],
      true_track: flight[10],
      vertical_rate: flight[11],
      icao24: flight[0],
      geo_altitude: flight[13],
      squawk: flight[14],
      spi: flight[15],
      position_source: flight[16]
    }
    
  } catch (error) {
    console.error('OpenSky API error:', error)
    
    // フォールバック: 日本周辺のフライトのみを取得
    try {
      const japanResponse = await fetch(
        'https://opensky-network.org/api/states/all?lamin=24&lomin=123&lamax=46&lomax=146',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FlightTracker/1.0)'
          }
        }
      )
      
      if (japanResponse.ok) {
        const japanData = await japanResponse.json()
        
        if (japanData.states) {
          const japanFlights = japanData.states.filter((state: any[]) => {
            const callsign = state[1]?.trim()
            return callsign && (
              callsign === flightNumber ||
              callsign.includes(flightNumber) ||
              flightNumber.includes(callsign)
            )
          })
          
          if (japanFlights.length > 0) {
            const flight = japanFlights[0]
            return {
              source: 'opensky_japan',
              callsign: flight[1]?.trim(),
              origin_country: flight[2],
              longitude: flight[5],
              latitude: flight[6],
              baro_altitude: flight[7],
              on_ground: flight[8],
              velocity: flight[9],
              true_track: flight[10],
              icao24: flight[0]
            }
          }
        }
      }
    } catch (fallbackError) {
      console.error('OpenSky fallback error:', fallbackError)
    }
    
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { aircraftModel, flightNumber } = await req.json()

    if (!flightNumber) {
      return NextResponse.json(
        { error: '便名が必要です' },
        { status: 400 }
      )
    }

    console.log(`🔍 Comprehensive search for flight: ${flightNumber}`)

    // 複数のAPIから包括的なフライトデータを取得
    const comprehensiveData = await getComprehensiveFlightData(flightNumber)
    
    if (!comprehensiveData.realtime && !comprehensiveData.schedule && !comprehensiveData.details) {
      return NextResponse.json(
        { error: 'フライト情報が見つかりませんでした。便名を確認してください。' },
        { status: 404 }
      )
    }

    // Anthropic Claudeクライアントを初期化
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // 取得したデータを統合して詳細な情報を作成
    const integratedData = {
      // リアルタイム位置情報（OpenSky）
      realtime: comprehensiveData.realtime,
      // スケジュール情報（AviationStack）
      schedule: comprehensiveData.schedule,
      // 詳細情報（FlightLabs）
      details: comprehensiveData.details,
      // 検索されたフライト番号
      searchedFlight: flightNumber
    }

    // Claude APIキーが設定されているかチェック
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'ANTHROPIC_API_KEY') {
      console.log('⚠️ Claude API key not configured, creating basic integrated data')
      
      // APIキーが設定されていない場合は統合データから基本情報を作成
      const basicFlightData = createBasicFlightResponse(integratedData)
      return NextResponse.json(basicFlightData)
    }

    // Claude AIで詳細な解析を実行
    const prompt = createComprehensivePrompt(integratedData)

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : ''

    // JSONレスポンスをパース
    let flightData
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : responseText
      
      console.log('Claude AI response:', responseText)
      
      flightData = JSON.parse(jsonString)
      
      if (!flightData.status || !flightData.currentLocation) {
        throw new Error('Invalid response structure')
      }
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      
      // パースに失敗した場合は基本統合データを返す
      flightData = createBasicFlightResponse(integratedData)
    }

    return NextResponse.json(flightData)
  } catch (error) {
    console.error('Flight tracking error:', error)
    return NextResponse.json(
      { error: 'フライト情報の取得に失敗しました。便名を確認してください。' },
      { status: 500 }
    )
  }
}

// 統合データから基本的なレスポンスを作成する関数
function createBasicFlightResponse(integratedData: any) {
  const realtime = integratedData.realtime
  const schedule = integratedData.schedule
  const details = integratedData.details
  
  return {
    status: schedule?.status || (realtime?.on_ground ? "地上" : "飛行中") || "状況不明",
    flightNumber: schedule?.flight_number || details?.flight_number || integratedData.searchedFlight,
    airline: schedule?.airline || details?.airline || "不明",
    aircraft: {
      model: details?.aircraft?.model || "不明",
      registration: schedule?.aircraft || details?.aircraft?.registration || "不明"
    },
    currentLocation: {
      latitude: realtime?.latitude || null,
      longitude: realtime?.longitude || null,
      city: "位置解析中...",
      region: realtime?.origin_country || "不明"
    },
    departure: {
      airport: schedule?.departure?.airport || "不明",
      scheduled: schedule?.departure?.scheduled || "不明",
      estimated: schedule?.departure?.estimated || "不明",
      actual: schedule?.departure?.actual || "不明",
      terminal: schedule?.departure?.terminal || "不明",
      gate: schedule?.departure?.gate || "不明"
    },
    arrival: {
      airport: schedule?.arrival?.airport || "不明", 
      scheduled: schedule?.arrival?.scheduled || "不明",
      estimated: schedule?.arrival?.estimated || "不明",
      actual: schedule?.arrival?.actual || "不明",
      terminal: schedule?.arrival?.terminal || "不明",
      gate: schedule?.arrival?.gate || "不明"
    },
    altitude: realtime?.baro_altitude ? `${realtime.baro_altitude}m` : "不明",
    speed: realtime?.velocity ? `${Math.round(realtime.velocity * 3.6)}km/h` : "不明",
    lastUpdate: realtime?.last_contact ? new Date(realtime.last_contact * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : "不明",
    dataAge: realtime?.last_contact ? `${Math.floor((Date.now() / 1000 - realtime.last_contact) / 60)}分前` : "不明",
    dataSources: [
      realtime ? 'OpenSky Network (リアルタイム位置)' : null,
      schedule ? 'AviationStack (スケジュール)' : null,
      details ? 'FlightLabs (詳細情報)' : null
    ].filter(Boolean),
    message: "複数のAPIから統合されたフライト情報です"
  }
}

// Claude AI用の包括的なプロンプトを作成する関数
function createComprehensivePrompt(integratedData: any) {
  const realtime = integratedData.realtime
  const schedule = integratedData.schedule  
  const details = integratedData.details
  
  return `
以下の複数のAPIから取得したフライト情報を統合して、日本語で詳細に解析してください。

【リアルタイム位置データ（OpenSky Network）】
${realtime ? `
- コールサイン: ${realtime.callsign}
- 現在位置: 緯度${realtime.latitude}, 経度${realtime.longitude}
- 高度: ${realtime.baro_altitude}m
- 速度: ${realtime.velocity}m/s (${Math.round((realtime.velocity || 0) * 3.6)}km/h)
- 地上状態: ${realtime.on_ground ? '地上' : '飛行中'}
- 最終更新: ${new Date(realtime.last_contact * 1000).toLocaleString('ja-JP')}
` : 'リアルタイムデータなし'}

【スケジュール情報（AviationStack）】
${schedule ? `
- フライト番号: ${schedule.flight_number}
- 航空会社: ${schedule.airline}
- 機体登録番号: ${schedule.aircraft}
- 出発空港: ${schedule.departure?.airport}
- 到着空港: ${schedule.arrival?.airport}  
- 出発予定: ${schedule.departure?.scheduled}
- 到着予定: ${schedule.arrival?.scheduled}
- フライト状況: ${schedule.status}
` : 'スケジュール情報なし'}

【詳細情報（FlightLabs）】
${details ? `
- フライト番号: ${details.flight_number}
- 航空会社: ${details.airline}
- 機種: ${details.aircraft?.model}
- 運航状況: ${details.status}
` : '詳細情報なし'}

これらの情報を統合して、以下のJSONフォーマットで返してください：

{
  "status": "統合されたフライト状況",
  "flightNumber": "フライト番号",
  "airline": "航空会社名",
  "aircraft": {
    "model": "機種名",
    "registration": "機体登録番号"
  },
  "currentLocation": {
    "latitude": 現在の緯度,
    "longitude": 現在の経度,
    "city": "現在地の都市名",
    "region": "現在地の地域名"
  },
  "departure": {
    "airport": "出発空港",
    "scheduled": "出発予定時刻",
    "estimated": "出発予想時刻", 
    "actual": "実際の出発時刻",
    "terminal": "出発ターミナル",
    "gate": "出発ゲート"
  },
  "arrival": {
    "airport": "到着空港",
    "scheduled": "到着予定時刻",
    "estimated": "到着予想時刻",
    "actual": "実際の到着時刻", 
    "terminal": "到着ターミナル",
    "gate": "到着ゲート"
  },
  "altitude": "現在高度",
  "speed": "現在速度",
  "weather": "現在地の天気",
  "lastUpdate": "データ最終更新時刻",
  "dataAge": "データ経過時間",
  "message": "総合的な状況説明"
}
`
}
