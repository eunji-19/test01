import { Request, Response, NextFunction } from "express";
import { bookService } from "../services";

/**
 * 인터파크 베스트셀러 API
 * categoryId : 100 국내도서
 * categoryId : 200 외국도서
 */
const getBestSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bestSellerResult = await bookService.getBookResult(
      "bestSeller",
      "bestSeller.api"
    );
    res.status(200).json({ statusMessage: bestSellerResult });
  } catch (err) {
    next(err);
  }
};

/**
 * 인터파크 추천도서 API
 */
const getRecommendSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recommendBookResult = await bookService.getBookResult(
      "recommendBook",
      "recommend.api"
    );
    res.status(200).json({ statueMessage: recommendBookResult });
  } catch (err) {
    next(err);
  }
};

/**
 * 인터파크 신규도서 API
 */
const getNewSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newBookResult = await bookService.getBookResult(
      "newBook",
      "newBook.api"
    );
    res.status(200).json({ statueMessage: newBookResult });
  } catch (err) {
    next(err);
  }
};

export default { getBestSeller, getRecommendSeller, getNewSeller };
