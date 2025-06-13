import { type NextRequest, NextResponse } from "next/server"

// Store for our numbers (simulating persistence)
// In a real app, you might use a database
const numberStore: {
  windowSize: number
  numbers: { [key: string]: number[] }
} = {
  windowSize: 10,
  numbers: {
    p: [], // prime
    f: [], // fibonacci
    e: [], // even
    r: [], // random
  },
}

// API endpoints for the test server
const API_ENDPOINTS = {
  p: "http://20.244.56.144/evaluation-service/primes",
  f: "http://20.244.56.144/evaluation-service/fibo",
  e: "http://20.244.56.144/evaluation-service/even",
  r: "http://20.244.56.144/evaluation-service/rand",
}

export async function GET(request: NextRequest, { params }: { params: { numberid: string } }) {
  const numberid = params.numberid

  // Check if the number ID is valid
  if (!["p", "f", "e", "r"].includes(numberid)) {
    return NextResponse.json({ error: "Invalid number ID. Use p, f, e, or r." }, { status: 400 })
  }

  try {
    // Store the previous state before making the API call
    const windowPrevState = [...numberStore.numbers[numberid]]

    // Fetch numbers from the third-party API with a timeout
    const numbers = await fetchNumbersWithTimeout(API_ENDPOINTS[numberid])

    // Process the numbers (ensure uniqueness and respect window size)
    processNumbers(numberid, numbers)

    // Calculate the average
    const avg = calculateAverage(numberStore.numbers[numberid])

    // Return the response
    return NextResponse.json({
      windowPrevState,
      windowCurrState: numberStore.numbers[numberid],
      numbers, // The numbers received from the third-party server
      avg,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}

// Fetch numbers with a timeout of 500ms
async function fetchNumbersWithTimeout(url: string): Promise<number[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 500)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return data.numbers || []
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out after 500ms")
    }
    throw error
  }
}

// Process the numbers: ensure uniqueness and respect window size
function processNumbers(numberid: string, newNumbers: number[]) {
  // Get the current numbers for this type
  const currentNumbers = numberStore.numbers[numberid]

  // Add new unique numbers
  for (const num of newNumbers) {
    if (!currentNumbers.includes(num)) {
      // If we've reached the window size, remove the oldest number
      if (currentNumbers.length >= numberStore.windowSize) {
        currentNumbers.shift() // Remove the oldest number (first in array)
      }
      currentNumbers.push(num) // Add the new number
    }
  }
}

// Calculate the average of numbers
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  return Number.parseFloat((sum / numbers.length).toFixed(2))
}
