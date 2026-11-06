import { Router } from "express";
import { isMongoUp } from "../lib/mongoose/index.js";
import authRouter from "./auth/index.js";
import collectionRouter from "./collection/index.js";
import craftRouter from "./craft/index.js";
import editEntryRouter from "./editEntry/index.js";
import enquiryRouter from "./enquiry/index.js";
import mediaRouter from "./media/index.js";
import orderRouter from "./order/index.js";
import pageRouter from "./page/index.js";
import productRouter from "./product/index.js";
import userRouter from "./user/index.js";

/**
 * Mounted at /api. Each domain router carries its own public paths
 * (/products) and CMS paths (/admin/products).
 */
const router = Router();

router.get("/ping", (_req, res) => {
  res.json({ success: true, data: { status: "ok", db: isMongoUp() ? "up" : "down", time: new Date() } });
});

router.use("/auth", authRouter);
router.use(productRouter);
router.use(craftRouter);
router.use(collectionRouter);
router.use(editEntryRouter);
router.use(enquiryRouter);
router.use(mediaRouter);
router.use(pageRouter);
router.use(orderRouter);
router.use(userRouter);

export default router;
