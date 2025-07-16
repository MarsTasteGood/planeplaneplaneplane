import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
// @ts-ignore
import { FlightRadar24API } from 'flightradar24-client'

// FlightRadar24を使用して実際のフライトデータを取得する関数
async function getFlightRadar24Data(flightNumber: string) {
  try {
    const fr24 = new FlightRadar24API()
    
    // フライト番号で検索
    const flights = await fr24.getFlights({ flight: flightNumber })
    
    if (flights && flights.length > 0) {
      const flight = flights[0]
      
      // フライト詳細を取得
      const flightDetails = await fr24.getFlightDetails(flight.id)
      
      return {
        flightNumber: flight.flight || flightNumber,
        callsign: flight.callsign,
        status: flight.status,
        aircraft: {
          registration: flight.aircraft?.registration,
          model: flight.aircraft?.model,
          age: flight.aircraft?.age
        },
        airline: {
          name: flight.airline?.name,
          icao: flight.airline?.icao,
          iata: flight.airline?.iata
        },
        departure: {
          airport: flight.airport?.origin?.name,
          iata: flight.airport?.origin?.iata,
          scheduled: flight.time?.scheduled?.departure,
          actual: flight.time?.real?.departure,
        },
        arrival: {
          airport: flight.airport?.destination?.name,
          iata: flight.airport?.destination?.iata,
          scheduled: flight.time?.scheduled?.arrival,
          estimated: flight.time?.estimated?.arrival,
        },
        position: {
          latitude: flight.lat,
          longitude: flight.lng,
          altitude: flight.altitude,
          speed: flight.speed,
          heading: flight.heading,
          vertical_speed: flight.vertical_speed
        },
        details: flightDetails
      }
    }
    
    return null
  } catch (error) {
    console.error('FlightRadar24 API error:', error)
    
    // フォールバック: 直接APIを呼び出し
    try {
      const response = await fetch(`https://www.flightradar24.com/v1/search/web/find?query=${flightNumber}&limit=50`)
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const flightResult = data.results.find((result: any) => 
          result.type === 'live' && result.label.includes(flightNumber)
        )
        
        if (flightResult) {
          return {
            flightNumber: flightNumber,
            callsign: flightResult.detail?.callsign,
            status: 'active',
            aircraft: {
              registration: flightResult.detail?.reg,
              model: flightResult.detail?.aircraft,
            },
            airline: {
              name: flightResult.detail?.airline,
            },
            departure: {
              airport: flightResult.detail?.origin,
              iata: flightResult.detail?.origin_iata,
            },
            arrival: {
              airport: flightResult.detail?.destination,
              iata: flightResult.detail?.destination_iata,
            },
            position: {
              latitude: flightResult.lat,
              longitude: flightResult.lng,
              altitude: flightResult.detail?.altitude,
              speed: flightResult.detail?.speed,
            }
          }
        }
      }
    } catch (fallbackError) {
      console.error('Fallback API error:', fallbackError)
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

    // FlightRadar24から実際のフライトデータを取得
    const actualFlightData = await getFlightRadar24Data(flightNumber)
    
    if (!actualFlightData) {
      return NextResponse.json(
        { error: 'フライト情報が見つかりませんでした。便名を確認してください。' },
        { status: 404 }
      )
    }

    // Anthropic Claudeクライアントを初期化
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // 実際のデータを基にClaude AIで追加情報を生成
    const prompt = `
以下のFlightRadar24から取得した実際のフライトデータを基に、日本語でわかりやすく整理して表示してください：

フライト番号: ${actualFlightData.flightNumber}
コールサイン: ${actualFlightData.callsign || 'N/A'}
ステータス: ${actualFlightData.status}
航空機: ${actualFlightData.aircraft?.model || 'N/A'} (登録: ${actualFlightData.aircraft?.registration || 'N/A'})
航空会社: ${actualFlightData.airline?.name || 'N/A'}
出発地: ${actualFlightData.departure.airport || 'N/A'} (${actualFlightData.departure.iata || 'N/A'})
到着地: ${actualFlightData.arrival.airport || 'N/A'} (${actualFlightData.arrival.iata || 'N/A'})
出発予定時刻: ${actualFlightData.departure.scheduled || 'N/A'}
到着予定時刻: ${actualFlightData.arrival.scheduled || 'N/A'}
${actualFlightData.position ? `現在位置: 緯度${actualFlightData.position.latitude}, 経度${actualFlightData.position.longitude}, 高度${actualFlightData.position.altitude}フィート, 速度${actualFlightData.position.speed}ノット, 方位${actualFlightData.position.heading}度` : ''}

以下のJSON形式で返してください：
{
  "status": "フライトステータス（日本語）",
  "currentLocation": {
    "latitude": 緯度（数値）,
    "longitude": 経度（数値）,
    "city": "現在地の都市名",
    "region": "現在地の地域名"
  },
  "origin": "出発空港名",
  "destination": "到着空港名",
  "altitude": "高度情報",
  "speed": "速度情報",
  "estimatedArrival": "到着予定時刻",
  "weather": "現在地の推定天気",
  "message": "フライト情報の要約（日本語）"
}
`

    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : ''

    // JSONレスポンスをパース
    let flightData
    try {
      flightData = JSON.parse(responseText)
    } catch (parseError) {
      // パースに失敗した場合は実際のデータから基本情報を作成
      flightData = {
        status: actualFlightData.status === 'active' ? '運航中' : 
                actualFlightData.status === 'landed' ? '着陸済み' : 
                actualFlightData.status === 'scheduled' ? '予定通り' : '不明',
        currentLocation: {
          latitude: actualFlightData.position?.latitude || 35.6762,
          longitude: actualFlightData.position?.longitude || 139.6503,
          city: "位置情報取得中",
          region: "追跡中"
        },
        origin: actualFlightData.departure.airport || "出発地不明",
        destination: actualFlightData.arrival.airport || "到着地不明",
        altitude: actualFlightData.position?.altitude ? `${actualFlightData.position.altitude}フィート` : "高度情報なし",
        speed: actualFlightData.position?.speed ? `${actualFlightData.position.speed}ノット` : "速度情報なし",
        estimatedArrival: actualFlightData.arrival.estimated || actualFlightData.arrival.scheduled || "到着時刻不明",
        weather: "天気情報取得中",
        message: `フライト ${actualFlightData.flightNumber} (${actualFlightData.airline?.name || '不明'}) のFlightRadar24からの実際の運航情報です。`
      }
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
