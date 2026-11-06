/**
 * @openapi
 * tags:
 *   - name: Studio
 *     description: Kesari Studio (CMS). Every route needs a Bearer token; RBAC decides the rest.
 *
 * /admin/products:
 *   get:
 *     tags: [Studio]
 *     summary: Every product, inactive included
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [active, inactive] } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200: { description: A page of products }
 *   post:
 *     tags: [Studio]
 *     summary: Create a product (slug generated from the name when omitted)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 *
 * /admin/products/{id}:
 *   parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   get: { tags: [Studio], summary: One product, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   patch: { tags: [Studio], summary: Update a product, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   delete: { tags: [Studio], summary: Delete a product (not while it is in The Edit), security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted }, 409: { description: In The Edit } } }
 *
 * /admin/crafts:
 *   get: { tags: [Studio], summary: Every craft story, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post: { tags: [Studio], summary: Create a craft story, security: [{ bearerAuth: [] }], responses: { 201: { description: Created } } }
 *
 * /admin/crafts/{id}:
 *   parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   get: { tags: [Studio], summary: One craft story, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   patch: { tags: [Studio], summary: Update a craft story, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   delete: { tags: [Studio], summary: Delete a craft story, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted } } }
 *
 * /admin/collections:
 *   get: { tags: [Studio], summary: Every collection, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post: { tags: [Studio], summary: Create a collection, security: [{ bearerAuth: [] }], responses: { 201: { description: Created } } }
 *
 * /admin/collections/{id}:
 *   parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   get: { tags: [Studio], summary: One collection, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   patch: { tags: [Studio], summary: Update a collection, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   delete: { tags: [Studio], summary: Delete a collection, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted } } }
 *
 * /admin/edit:
 *   get: { tags: [Studio], summary: The Edit with drafts, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post: { tags: [Studio], summary: Add an entry, security: [{ bearerAuth: [] }], responses: { 201: { description: Created } } }
 *
 * /admin/edit/order:
 *   put: { tags: [Studio], summary: "Reorder: send every id exactly once", security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *
 * /admin/edit/{id}:
 *   parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   patch: { tags: [Studio], summary: Update an entry, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   delete: { tags: [Studio], summary: Remove an entry, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted } } }
 *
 * /admin/enquiries:
 *   get: { tags: [Studio], summary: Enquiries, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *
 * /admin/enquiries/{id}:
 *   parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   patch: { tags: [Studio], summary: Status and internal note, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   delete: { tags: [Studio], summary: Delete an enquiry, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted } } }
 *
 * /admin/media:
 *   get: { tags: [Studio], summary: Media library, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post:
 *     tags: [Studio]
 *     summary: Upload a file to S3
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               alt: { type: string }
 *               folder: { type: string, example: products/soft-ivory }
 *     responses:
 *       201: { description: Created }
 *
 * /admin/media/{id}:
 *   parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   patch: { tags: [Studio], summary: Update alt text, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   delete: { tags: [Studio], summary: Delete from S3 and the library, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted } } }
 *
 * /admin/pages:
 *   get: { tags: [Studio], summary: Every editable page and its status, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *
 * /admin/pages/{slug}:
 *   parameters: [{ in: path, name: slug, required: true, schema: { type: string } }]
 *   get: { tags: [Studio], summary: Editor view (draft and published), security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   put: { tags: [Studio], summary: "Save the draft: { content }", security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *
 * /admin/pages/{slug}/publish:
 *   parameters: [{ in: path, name: slug, required: true, schema: { type: string } }]
 *   post: { tags: [Studio], summary: Publish the draft, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *
 * /admin/orders:
 *   get: { tags: [Studio], summary: Orders, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post: { tags: [Studio], summary: Record a sale, security: [{ bearerAuth: [] }], responses: { 201: { description: Created } } }
 *
 * /admin/orders/{id}:
 *   parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   patch: { tags: [Studio], summary: Update an order (totals recomputed), security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   delete: { tags: [Studio], summary: Delete an order, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted } } }
 *
 * /admin/analytics/sales:
 *   get:
 *     tags: [Studio]
 *     summary: Sales dashboard
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: query, name: range, schema: { type: string, enum: [7d, 30d, 90d, 12m] } }]
 *     responses:
 *       200: { description: OK }
 *
 * /admin/users:
 *   get: { tags: [Studio], summary: The team (admin only), security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post: { tags: [Studio], summary: Add a member (admin only), security: [{ bearerAuth: [] }], responses: { 201: { description: Created } } }
 *
 * /admin/users/{id}:
 *   parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   patch: { tags: [Studio], summary: Update a member (keeps one active admin), security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   delete: { tags: [Studio], summary: Remove a member, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted } } }
 */
export {};
