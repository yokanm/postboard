# CLAUDE.md

## AI Development Instructions

You are working on Postboard Backend.

This is a production-grade multi-tenant SaaS application.

All changes must preserve strict tenant isolation.

---

# Before Writing Code

Always identify:

* Actor
* Resource
* Ownership
* Tenant Boundary
* Permission Level

Before modifying any endpoint ask:

1. Who is performing this action?
2. What resource is being accessed?
3. Who owns the resource?
4. Does the actor belong to the same company?
5. Is SUPERADMIN required?

If any answer is unclear, stop and investigate.

---

# Authorization First

Never implement business logic before authorization logic.

Correct order:

1. Authenticate
2. Load Actor
3. Authorize
4. Validate Ownership
5. Execute Business Logic
6. Audit Log

Never reverse this order.

---

# Multi-Tenant Requirements

Company A must never access Company B resources.

This applies to:

* Reads
* Writes
* Updates
* Deletes
* Analytics
* Audit Logs
* Search
* Exports

All tenant-owned queries must be scoped.

Required pattern:

```ts
companyId: actor.companyId
```

unless actor is SUPERADMIN.

---

# SUPERADMIN Rules

SUPERADMIN is the only platform-wide role.

Only SUPERADMIN may:

* Verify companies
* Access all users
* Access all companies
* Access platform analytics
* Access global audit logs
* Perform platform moderation

ADMIN must never receive platform-wide access.

---

# ADMIN Rules

ADMIN is company-scoped.

ADMIN may only manage resources belonging to their company.

ADMIN must never access resources belonging to another company.

---

# Service Design Rules

Authorization belongs in services.

Controllers should remain thin.

Controllers:

* Parse requests
* Call services
* Return responses

Services:

* Validate permissions
* Validate ownership
* Execute business logic

---

# Prisma Query Rules

Before using:

```ts
findMany
findFirst
update
delete
updateMany
deleteMany
```

verify tenant filtering exists.

Reject unrestricted queries against tenant-owned resources.

---

# Security Validation

When changing code:

Search for:

```ts
findMany(
update(
delete(
updateMany(
deleteMany(
```

Verify tenant protection for every occurrence.

---

# Prohibited Changes

Never:

* Remove authorization checks
* Bypass middleware
* Trust client-supplied companyId
* Trust JWT role claims without DB verification
* Grant ADMIN platform-wide access
* Introduce wildcard permissions

---

# Success Criteria

A change is complete only if:

* TypeScript compiles
* Tests pass
* Tenant isolation is preserved
* No privilege escalation exists
* No IDOR vulnerabilities exist
* Authorization logic is centralized
* Audit logs remain intact
