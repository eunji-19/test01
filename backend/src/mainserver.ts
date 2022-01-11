import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { MongoConnector } from "./mongo-connector";
import cookieParser from "cookie-parser";

import { authRouter, bookRouter } from "./routes";

export class MainServer {
  private app: any;

  constructor() {
    dotenv.config();
    this.app = express();
  }

  async start(): Promise<void> {
    // const mongoConnector = new MongoConnector();
    // await mongoConnector.connect();

    this.app.use("/uploads", express.static("uploads"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(cookieParser());

    /**
     * Router 설정
     */
    this.app.use("/api/auth", authRouter);
    this.app.use("/api/book", bookRouter);

    /**
     * Server 연결
     */
    const PORT = process.env.PORT || 4000;
    this.app.listen(PORT, () => {
      console.log(`server is listening at ${PORT}`);
    });
  }
}
