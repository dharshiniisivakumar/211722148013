"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const testEndpoint = async (type: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/numbers/${type}`)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Average Calculator Microservice</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Endpoints</CardTitle>
            <CardDescription>Click to test different number types</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => testEndpoint("p")}>Prime Numbers (p)</Button>
            <Button onClick={() => testEndpoint("f")}>Fibonacci Numbers (f)</Button>
            <Button onClick={() => testEndpoint("e")}>Even Numbers (e)</Button>
            <Button onClick={() => testEndpoint("r")}>Random Numbers (r)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Information</CardTitle>
            <CardDescription>Endpoint details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <strong>Base URL:</strong> http://localhost:3000/api/numbers/{"{numberid}"}
            </p>
            <p className="text-sm mt-2">
              <strong>Supported IDs:</strong> p (prime), f (fibonacci), e (even), r (random)
            </p>
            <p className="text-sm mt-2">
              <strong>Window Size:</strong> 10
            </p>
          </CardContent>
        </Card>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading && <p>Loading...</p>}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
