import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import { server } from "../fixtures/server"

const BASE = "http://localhost:5000/api/v1"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("Company API", () => {
  it("returns current company profile", async () => {
    const res = await fetch(`${BASE}/company/current`, {
      headers: { Authorization: "Bearer mock-token" },
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.name).toBe("Acme Corp")
    expect(data.industry).toBe("Technology")
  })

  it("returns company by id", async () => {
    const res = await fetch(`${BASE}/company/company-1`)
    const data = await res.json()
    expect(data.id).toBe("company-1")
    expect(data.name).toBe("Acme Corp")
  })

  it("returns team members", async () => {
    const res = await fetch(`${BASE}/company/current/team`, {
      headers: { Authorization: "Bearer mock-token" },
    })
    const data = await res.json()
    expect(data.members).toHaveLength(1)
    expect(data.members[0].role).toBe("ADMIN")
  })

  it("sends team invite", async () => {
    const res = await fetch(`${BASE}/company/current/team/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer mock-token",
      },
      body: JSON.stringify({ email: "new@example.com", role: "MEMBER" }),
    })
    expect(res.status).toBe(200)
  })
})
