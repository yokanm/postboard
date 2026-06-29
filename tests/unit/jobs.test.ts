import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import { server } from "../fixtures/server"

const BASE = "http://localhost:5000/api/v1"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("Jobs API", () => {
  it("returns job listings", async () => {
    const res = await fetch(`${BASE}/job`)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.jobs).toHaveLength(1)
    expect(data.jobs[0].title).toBe("Senior Engineer")
  })

  it("returns job detail by id", async () => {
    const res = await fetch(`${BASE}/job/job-1`)
    const data = await res.json()
    expect(data.job.id).toBe("job-1")
    expect(data.job.company.name).toBe("Acme Corp")
  })

  it("allows applying to a job", async () => {
    const res = await fetch(`${BASE}/job/job-1/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer mock-token",
      },
      body: JSON.stringify({}),
    })
    const data = await res.json()
    expect(data.application.status).toBe("PENDING")
  })
})
