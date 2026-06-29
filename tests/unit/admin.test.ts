import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import { server } from "../fixtures/server"

const BASE = "http://localhost:5000/api/v1"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("Admin API", () => {
  it("returns platform stats", async () => {
    const res = await fetch(`${BASE}/admin/stats`, {
      headers: { Authorization: "Bearer admin-token" },
    })
    const data = await res.json()
    expect(data.stats.users.total).toBe(100)
    expect(data.stats.jobs.open).toBe(30)
    expect(data.stats.applications.pending).toBe(25)
  })
})
