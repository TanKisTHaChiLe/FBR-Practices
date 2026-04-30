import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379",
});

export const initRedis = async () => {
  redisClient.on("error", (error) => {
    console.error(error);
  });
  redisClient.on("connect", () => {
    console.log("Redis connect");
  });

  await redisClient.connect();
};

export default redisClient