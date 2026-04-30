import { NextFunction, Request, Response } from "express";
import { getFromRedis } from "../redis/redis-utils";

export const cacheMiddleware =
  (ttl = 60) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = req.originalUrl;
    try {
      const data = await getFromRedis(cacheKey);
      if (data) {
        return res.send(data);
      }
      res.locals.cacheKey = cacheKey;

      res.locals.ttl = ttl;

      next();
    } catch (err) {
      console.error(err);
      next();
    }
  };
