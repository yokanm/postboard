// src/routes/v1/tags.route.ts
import { Router } from "express";
import { listTags } from "@/controller/v1/tags/tags";

const router = Router();

/**
 * @openapi
 * /tags:
 *   get:
 *     tags: [Tags]
 *     summary: List all job tags
 *     description: |
 *       Returns every active tag in the taxonomy, ordered alphabetically.
 *       Public — no authentication required. Results are cached in Redis.
 *       Use tag `slug` values when filtering jobs via `GET /job?tags=nodejs,typescript`.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Filter tags by name prefix (e.g. `type` matches `typescript`, `typegraphql`)
 *     responses:
 *       200:
 *         description: Tag list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:   { type: string }
 *                       name: { type: string, example: TypeScript }
 *                       slug: { type: string, example: typescript }
 *                       _count:
 *                         type: object
 *                         properties:
 *                           jobs: { type: integer, description: Number of open jobs using this tag }
 */
router.get("/", listTags);

export default router;
