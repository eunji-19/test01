import express, { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../config/authRequest";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ statusMessage: "Home Page" });
  } catch (err) {
    res.status(400).json({ statusMessage: err.message });
  }
});

export = router;
