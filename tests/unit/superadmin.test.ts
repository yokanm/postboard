import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import { server } from "../fixtures/server"

const BASE = "http://localhost:5000/api/v1"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("SuperAdmin API", () => {
  it("login succeeds with valid credentials", async () => {
    const res = await fetch(`${BASE}/superadmin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@platform.com", password: "admin123" }),
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.accessToken).toBe("sa-mock-token")
    expect(data.admin.email).toBe("admin@platform.com")
  })

  it("login fails with invalid credentials", async () => {
    const res = await fetch(`${BASE}/superadmin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@platform.com", password: "wrong" }),
    })
    expect(res.status).toBe(401)
  })

  it("returns platform stats", async () => {
    const res = await fetch(`${BASE}/superadmin/stats`, {
      headers: { Authorization: "Bearer sa-mock-token" },
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.users.total).toBe(100)
    expect(data.companies.verified).toBe(15)
    expect(data.jobs.open).toBe(30)
  })

  it("returns candidates list", async () => {
    const res = await fetch(`${BASE}/superadmin/candidates`, {
      headers: { Authorization: "Bearer sa-mock-token" },
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.candidates).toHaveLength(1)
    expect(data.candidates[0].email).toBe("test@example.com")
    expect(data.pagination.totalPages).toBe(1)
  })

  it("returns companies list", async () => {
    const res = await fetch(`${BASE}/superadmin/companies`, {
      headers: { Authorization: "Bearer sa-mock-token" },
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.companies).toHaveLength(1)
    expect(data.companies[0].name).toBe("Acme Corp")
  })

  it("returns jobs list", async () => {
    const res = await fetch(`${BASE}/superadmin/jobs`, {
      headers: { Authorization: "Bearer sa-mock-token" },
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.jobs).toHaveLength(1)
    expect(data.jobs[0].title).toBe("Senior Engineer")
  })

  it("returns security events", async () => {
    const res = await fetch(`${BASE}/superadmin/security-events`, {
      headers: { Authorization: "Bearer sa-mock-token" },
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.events).toHaveLength(1)
    expect(data.events[0].type).toBe("FAILED_LOGIN")
  })

  it("returns ownerless companies", async () => {
    const res = await fetch(`${BASE}/superadmin/ownerless-companies`, {
      headers: { Authorization: "Bearer sa-mock-token" },
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.companies).toHaveLength(1)
    expect(data.companies[0].name).toBe("Orphan Corp")
  })

  it("bans a candidate", async () => {
    const res = await fetch(`${BASE}/superadmin/candidates/user-1/ban`, {
      method: "DELETE",
      headers: { Authorization: "Bearer sa-mock-token" },
    })
    expect(res.status).toBe(200)
  })

  it("force closes a job", async () => {
    const res = await fetch(`${BASE}/superadmin/jobs/job-1/force-close`, {
      method: "DELETE",
      headers: { Authorization: "Bearer sa-mock-token" },
    })
    expect(res.status).toBe(200)
  })

  it("verifies a company", async () => {
    const res = await fetch(`${BASE}/superadmin/companies/company-1/verify`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sa-mock-token",
      },
      body: JSON.stringify({ isVerified: true }),
    })
    expect(res.status).toBe(200)
  })

  it("deletes a company", async () => {
    const res = await fetch(`${BASE}/superadmin/companies/company-1`, {
      method: "DELETE",
      headers: { Authorization: "Bearer sa-mock-token" },
    })
    expect(res.status).toBe(200)
  })

  it("recovers ownership", async () => {
    const res = await fetch(`${BASE}/superadmin/companies/company-2/recover-ownership`, {
      method: "POST",
      headers: { Authorization: "Bearer sa-mock-token" },
    })
    expect(res.status).toBe(200)
  })
})
