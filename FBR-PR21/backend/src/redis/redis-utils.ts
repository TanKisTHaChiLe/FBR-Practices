import redisClient from "./redis-client";
import { Response } from "express";

export const getFromRedis = async (key: string) => {
  const data = await redisClient.get(key);

  if (data) {
    return JSON.parse(data);
  }

  return null;
};

export const saveToRedis = async (key: string, data: any, ttl = 60) => {
  console.log(key, "save");
  await redisClient.set(key, JSON.stringify(data), {
    EX: ttl,
  });
};

export const checkResponse = (res: Response, data: any) => {
  if (res.locals.cacheKey) {
    saveToRedis(res.locals.cacheKey, data, res.locals.ttl);
  }
};
