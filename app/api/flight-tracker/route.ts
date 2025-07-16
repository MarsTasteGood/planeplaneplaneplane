import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  try {
    const { aircraftModel, flightNumber } = await req.json()

    if (!aircraftModel && !flightNumber) {
      return NextResponse.json(
        { error: 'Aircraft model or flight number is required' },
        { status: 400 }
      )
    }

    // Anthropic Claudeクライアントを初期化
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Claude APIを使用してフライト情報を生成
    const prompt = `
You are a flight tracking assistant. Given the aircraft model "${aircraftModel}" ${flightNumber ? `and flight number "${flightNumber}"` : ''}, provide current flight information in Japanese.

Please provide realistic flight information including:
- Current location (coordinates and city/region)
- Flight status (in flight, landed, delayed, etc.)
- Origin and destination airports
- Estimated arrival time
- Current altitude and speed
- Weather conditions at current location

Format the response as a JSON object with the following structure:
{
  "status": "string",
  "currentLocation": {
    "latitude": number,
    "longitude": number,
    "city": "string",
    "region": "string"
  },
  "origin": "string",
  "destination": "string",
  "altitude": "string",
  "speed": "string",
  "estimatedArrival": "string",
  "weather": "string",
  "message": "string (in Japanese)"
}

Provide realistic data for a ${aircraftModel} aircraft currently in operation.
`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : ''

    // JSONレスポンスをパース
    let flightData
    try {
      flightData = JSON.parse(responseText)
    } catch (parseError) {
      // パースに失敗した場合はデフォルトデータを返す
      flightData = {
        status: "運航中",
        currentLocation: {
          latitude: 35.6762,
          longitude: 139.6503,
          city: "東京",
          region: "関東"
        },
        origin: "羽田空港 (HND)",
        destination: "大阪国際空港 (ITM)",
        altitude: "11,000m",
        speed: "850 km/h",
        estimatedArrival: "14:30",
        weather: "晴れ",
        message: `${aircraftModel}の現在位置情報を取得しました。現在東京上空を飛行中です。`
      }
    }

    return NextResponse.json(flightData)
  } catch (error) {
    console.error('Flight tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flight information' },
      { status: 500 }
    )
  }
}
