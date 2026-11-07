/**
 * @openapi
 * tags:
 *   - name: Health
 *   - name: Auth
 *   - name: Storefront
 *     description: Public endpoints the website reads and posts to.
 *
 * /ping:
 *   get:
 *     tags: [Health]
 *     summary: Health payload (API and database status)
 *     responses:
 *       200: { description: OK }
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in to Kesari Studio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: "{ token, user }" }
 *       401: { description: Email or password is incorrect }
 *
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: The signed-in user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *
 * /auth/password:
 *   patch:
 *     tags: [Auth]
 *     summary: Change your password
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 10 }
 *     responses:
 *       204: { description: Changed }
 *
 * /products:
 *   get:
 *     tags: [Storefront]
 *     summary: Active products
 *     parameters:
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: craft, schema: { type: string } }
 *       - { in: query, name: featured, schema: { type: boolean } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *     responses:
 *       200: { description: A page of products }
 *
 * /products/{key}:
 *   get:
 *     tags: [Storefront]
 *     summary: One active product by id (or legacy slug)
 *     parameters: [{ in: path, name: key, required: true, description: "Product id; a slug also resolves", schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *
 * /pages/{slug}:
 *   get:
 *     tags: [Storefront]
 *     summary: Published content of a page
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string, enum: [home, whats-new, weddings, womenswear, menswear, atelier, world-of-kesari, site] }
 *     responses:
 *       200: { description: "{ slug, content, publishedAt }" }
 *       404: { description: Never published }
 *
 * /enquiries:
 *   post:
 *     tags: [Storefront]
 *     summary: Atelier form
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               weddingDate: { type: string, format: date }
 *               note: { type: string }
 *     responses:
 *       201: { description: "{ id, receivedAt }" }
 *
 * /orders:
 *   post:
 *     tags: [Storefront]
 *     summary: Order request from the bag (prices come from the catalogue)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer, items]
 *             properties:
 *               customer:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   phone: { type: string }
 *                   email: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     slug: { type: string }
 *                     quantity: { type: integer }
 *               channel: { type: string, enum: [website, whatsapp] }
 *     responses:
 *       201: { description: "{ orderNumber, totalInr }" }
 */
export {};
