import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import { server } from "../fixtures/server"

const BASE = "http://localhost:5000/api/v1"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("Profile API", () => {
  it("returns user profile", async () => {
    const res = await fetch(`${BASE}/user/current/profile`, {
      headers: { Authorization: "Bearer mock-token" },
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.profile.bio).toBe("A test user")
    expect(data.profile.skills).toContain("TypeScript")
  })
})
