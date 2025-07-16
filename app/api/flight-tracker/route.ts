import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// OpenSky Network APIを使用してリアルタイムフライトデータを取得する関数
async function getOpenSkyFlightData(flightNumber: string) {
  try {
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
      return null
    }
    
    // フライト番号で検索（部分一致も含む）
    const matchingFlights = data.states.filter((state: any[]) => {
      const callsign = state[1]?.trim()
      return callsign && (
        callsign === flightNumber ||
        callsign.includes(flightNumber) ||
        flightNumber.includes(callsign)
      )
    })
    
    if (matchingFlights.length === 0) {
      return null
    }
    
    // 最初にマッチしたフライトを使用
    const flight = matchingFlights[0]
    
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

    // OpenSky Network APIから実際のフライトデータを取得
    const actualFlightData = await getOpenSkyFlightData(flightNumber)
    
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
以下のOpenSky Network APIから取得したリアルタイムフライトデータを基に、日本語でわかりやすく整理して表示してください：

フライト番号/コールサイン: ${flightNumber} (実際: ${actualFlightData.callsign})
データソース: ${actualFlightData.source}
出発国: ${actualFlightData.origin_country}
現在位置: 緯度${actualFlightData.latitude}, 経度${actualFlightData.longitude}
高度: ${actualFlightData.baro_altitude}メートル (${actualFlightData.geo_altitude}メートル)
地上状態: ${actualFlightData.on_ground ? '地上' : '飛行中'}
速度: ${actualFlightData.velocity}m/s
進行方向: ${actualFlightData.true_track}度
垂直速度: ${actualFlightData.vertical_rate}m/s
ICAO24コード: ${actualFlightData.icao24}
最終接触時刻: ${new Date((actualFlightData.last_contact || 0) * 1000).toISOString()}

これらの実際のリアルタイムデータを基に、以下のJSON形式で返してください：
{
  "status": "フライトステータス（日本語）",
  "currentLocation": {
    "latitude": ${actualFlightData.latitude},
    "longitude": ${actualFlightData.longitude},
    "city": "現在地の都市名（推測）",
    "region": "現在地の地域名（推測）"
  },
  "origin": "出発地（${actualFlightData.origin_country}より推測）",
  "destination": "到着地（推測）",
  "altitude": "${actualFlightData.baro_altitude}m",
  "speed": "${Math.round((actualFlightData.velocity || 0) * 3.6)}km/h",
  "estimatedArrival": "到着予定時刻（推測）",
  "weather": "現在地の推定天気",
  "message": "OpenSky Network APIからのリアルタイム航空機追跡データです。"
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
      // パースに失敗した場合はOpenSkyデータから基本情報を作成
      flightData = {
        status: actualFlightData.on_ground ? "地上" : "飛行中",
        currentLocation: {
          latitude: actualFlightData.latitude || 35.6762,
          longitude: actualFlightData.longitude || 139.6503,
          city: "位置情報解析中",
          region: actualFlightData.origin_country || "不明"
        },
        origin: actualFlightData.origin_country || "不明",
        destination: "到着地解析中",
        altitude: actualFlightData.baro_altitude ? `${actualFlightData.baro_altitude}m` : "不明",
        speed: actualFlightData.velocity ? `${Math.round(actualFlightData.velocity * 3.6)}km/h` : "不明",
        estimatedArrival: "計算中",
        weather: "天気情報取得中",
        message: `フライト ${actualFlightData.callsign || flightNumber} の情報をOpenSky Network APIから取得しました。AI解析に失敗したため基本データを表示中です。`
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
