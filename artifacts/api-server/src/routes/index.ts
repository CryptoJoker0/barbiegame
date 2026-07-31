import { Router, type IRouter } from "express";
import healthRouter from "./health";
import playersRouter from "./players";
import gameRouter from "./game";
import gamesRouter from "./games";
import paymentsRouter from "./payments";
import leaderboardRouter from "./leaderboard";
import achievementsRouter from "./achievements";
import announcementsRouter from "./announcements";
import nftRouter from "./nft";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(playersRouter);
router.use(gameRouter);
router.use(gamesRouter);
router.use(paymentsRouter);
router.use(leaderboardRouter);
router.use(achievementsRouter);
router.use(announcementsRouter);
router.use(nftRouter);
router.use(adminRouter);

export default router;
