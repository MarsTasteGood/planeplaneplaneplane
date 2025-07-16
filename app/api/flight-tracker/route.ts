import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

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

    // Claude APIキーが正しく設定されているかチェック
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'ANTHROPIC_API_KEY') {
      console.log('⚠️ Claude API key not configured, using basic OpenSky data only')
      
      // APIキーが設定されていない場合はOpenSkyデータから直接作成
      const basicFlightData = {
        status: actualFlightData.on_ground ? "地上" : "飛行中",
        currentLocation: {
          latitude: actualFlightData.latitude || 35.6762,
          longitude: actualFlightData.longitude || 139.6503,
          city: "位置解析中...",
          region: actualFlightData.origin_country || "不明"
        },
        origin: actualFlightData.origin_country || "不明",
        destination: "到着地解析中...",
        altitude: actualFlightData.baro_altitude ? `${actualFlightData.baro_altitude}m` : "不明",
        speed: actualFlightData.velocity ? `${Math.round(actualFlightData.velocity * 3.6)}km/h` : "不明",
        estimatedArrival: "計算中...",
        weather: "天気情報取得中...",
        lastUpdate: actualFlightData.last_contact ? new Date(actualFlightData.last_contact * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : "不明",
        dataAge: actualFlightData.last_contact ? `${Math.floor((Date.now() / 1000 - actualFlightData.last_contact) / 60)}分前` : "不明",
        message: `✈️ フライト ${actualFlightData.callsign || flightNumber} のリアルタイムデータを表示中です（OpenSky Network APIより）`
      }
      
      return NextResponse.json(basicFlightData)
    }

    // 実際のデータを基にClaude AIで追加情報を生成
    const prompt = `
以下のOpenSky Network APIから取得したリアルタイムフライトデータを日本語で解析してください。

フライトデータ:
- コールサイン: ${actualFlightData.callsign || flightNumber}
- 出発国: ${actualFlightData.origin_country}
- 現在位置: 緯度${actualFlightData.latitude}, 経度${actualFlightData.longitude}
- 高度: ${actualFlightData.baro_altitude}m
- 速度: ${actualFlightData.velocity}m/s (${Math.round((actualFlightData.velocity || 0) * 3.6)}km/h)
- 地上状態: ${actualFlightData.on_ground ? '地上' : '飛行中'}
- 進行方向: ${actualFlightData.true_track}度
- 最終更新: ${actualFlightData.last_contact ? new Date(actualFlightData.last_contact * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : '不明'}
- データ経過時間: ${actualFlightData.last_contact ? Math.floor((Date.now() / 1000 - actualFlightData.last_contact) / 60) : 0}分前

以下のJSONフォーマットで必ず返答してください（他の文章は一切含めず、JSONのみを返してください）:

{
  "status": "${actualFlightData.on_ground ? '地上' : '飛行中'}",
  "currentLocation": {
    "latitude": ${actualFlightData.latitude || 35.6762},
    "longitude": ${actualFlightData.longitude || 139.6503},
    "city": "現在地の都市名を推測",
    "region": "${actualFlightData.origin_country || '不明'}"
  },
  "origin": "出発地を推測",
  "destination": "到着地を推測", 
  "altitude": "${actualFlightData.baro_altitude || 0}m",
  "speed": "${Math.round((actualFlightData.velocity || 0) * 3.6)}km/h",
  "estimatedArrival": "到着予定時刻を推測",
  "weather": "現在地の天気を推測",
  "lastUpdate": "${actualFlightData.last_contact ? new Date(actualFlightData.last_contact * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : '不明'}",
  "dataAge": "${actualFlightData.last_contact ? Math.floor((Date.now() / 1000 - actualFlightData.last_contact) / 60) : 0}分前",
  "message": "OpenSky Network APIからのリアルタイム追跡データ"
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : ''

    // JSONレスポンスをパース
    let flightData
    try {
      // レスポンスからJSONのみを抽出
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : responseText
      
      console.log('Claude AI response:', responseText)
      console.log('Extracted JSON:', jsonString)
      
      flightData = JSON.parse(jsonString)
      
      // 必須フィールドの検証
      if (!flightData.status || !flightData.currentLocation) {
        throw new Error('Invalid response structure')
      }
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', responseText)
      
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
        lastUpdate: actualFlightData.last_contact ? new Date(actualFlightData.last_contact * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : "不明",
        dataAge: actualFlightData.last_contact ? `${Math.floor((Date.now() / 1000 - actualFlightData.last_contact) / 60)}分前` : "不明",
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
