import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "../fixtures/server"

const BASE = "http://localhost:5000/api/v1"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("Auth API", () => {
  it("login succeeds with valid credentials", async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.accessToken).toBeDefined()
    expect(data.user.role).toBe("CANDIDATE")
  })

  it("login fails with invalid credentials", async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "wrong@example.com", password: "wrong" }),
    })
    expect(res.status).toBe(401)
  })

  it("register returns 409 for duplicate email", async () => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "existing@example.com", password: "test1234" }),
    })
    expect(res.status).toBe(409)
  })

  it("current user endpoint returns user data", async () => {
    const res = await fetch(`${BASE}/user/current`, {
      headers: { Authorization: "Bearer mock-token" },
    })
    const data = await res.json()
    expect(data.email).toBe("test@example.com")
    expect(data.role).toBe("CANDIDATE")
  })
})
