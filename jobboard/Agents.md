# AGENTS.md

# Postboard Backend Engineering Rules

## Project Overview

Postboard is a multi-tenant SaaS Job Board platform.

Every company is an isolated tenant.

Security and tenant isolation are higher priority than feature development.

No feature may bypass authentication, authorization, ownership validation, or tenant boundaries.

---

# Core Principle

Assume every request is hostile until verified.

Every endpoint must verify:

1. Authentication
2. Authorization
3. Tenant ownership
4. Resource ownership

Never trust client input.

Never trust route parameters.

Never trust JWT role claims without database verification.

---

# Tenant Isolation Rules

The system is multi-tenant.

Company data must never leak across tenants.

The following resources are tenant-owned:

* Users
* Recruiters
* Jobs
* Applications
* Notifications
* Audit Logs
* Analytics
* Company Settings

Every query involving tenant-owned resources must include company scoping.

Required pattern:

```ts
where: {
  companyId: actor.companyId
}
```

Unless actor is SUPERADMIN.

---

# Role Hierarchy

SUPERADMIN
ADMIN
RECRUITER
CANDIDATE

Permissions flow downward.

Higher roles inherit lower-role access only when explicitly intended.

ADMIN is NOT a platform administrator.

SUPERADMIN is the only platform administrator.

---

# Authorization Rules

Never perform authorization inside controllers.

Controllers must delegate to services.

Services must use centralized permission helpers.

Required helpers:

* canManageUser()
* canManageCompany()
* canManageJob()
* canManageApplication()
* canViewAuditLogs()

Never duplicate authorization logic.

---

# Forbidden Patterns

Never write:

```ts
if (user.role === "ADMIN")
```

without ownership validation.

Never write:

```ts
prisma.user.findMany()
```

for tenant resources without company filtering.

Never write:

```ts
prisma.job.findMany()
```

without tenant filtering.

Never write update/delete operations before validating ownership.

---

# Resource Ownership Validation

Before updating or deleting:

1. Load resource.
2. Validate ownership.
3. Validate permissions.
4. Execute mutation.

Required pattern:

```ts
const resource = await prisma.resource.findUnique(...)

assertCanManageResource(actor, resource)

await prisma.resource.update(...)
```

Never mutate first.

---

# Route Protection

Every protected route must include:

Authentication middleware.

Authorization middleware.

Ownership validation.

No exceptions.

---

# Audit Logging

Security-sensitive actions must generate audit logs.

Examples:

* User role changes
* User deactivation
* Company verification
* Job deletion
* Application status updates
* Password reset actions

Audit logs must include:

* actorId
* targetId
* companyId
* action
* timestamp

---

# Prisma Rules

Never expose soft-deleted records.

Required filter:

```ts
deletedAt: null
```

where applicable.

Never use unrestricted findMany on tenant-owned resources.

---

# Code Review Checklist

Every PR must answer:

* Is tenant isolation enforced?
* Is authorization enforced?
* Is ownership enforced?
* Can another company access this resource?
* Can route parameters be abused?
* Can privilege escalation occur?
* Are audit logs generated?

If any answer is uncertain, the PR is not ready.

---

# Security Priority Order

1. Authentication
2. Authorization
3. Tenant Isolation
4. Data Integrity
5. Business Logic
6. Performance
7. Convenience

Security always wins over convenience.
