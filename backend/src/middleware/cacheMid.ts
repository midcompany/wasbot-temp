import { Request, Response, NextFunction } from "express";
import { redisClient } from "../utils/redis";

const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const key = req.originalUrl || req.url;
  try {
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      console.log('cache hit', key)
      res.send(JSON.parse(cachedData));
      return;
    }

    const originalSend = res.send.bind(res);
    res.send = (body: any): Response => {
      originalSend(body);
      redisClient.set(key, body, { EX: 3600 }).catch(err => {
        console.error("Erro ao salvar no cache Redis:", err);
      });
      return res;
    };

    next();
  } catch (err) {
    console.error("Erro ao acessar o cache Redis:", err);
    next();
  }
};

const getCacheItem = async (key: string) => {
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch {}
};

const clearCache = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const key = req.originalUrl || req.url;

  try {
    const isDeleted = await redisClient.del(key);
    if (isDeleted) {
      console.log(`Cache removido para ${key}`);
    }
    next();
  } catch (err) {
    console.error("Erro ao limpar o cache Redis:", err);
    next();
  }
};

const updateCache = async (key: string, item: any) => {
  let cachedData = await redisClient.get(key);

  if (cachedData) {
    const cacheArray = JSON.parse(cachedData);
    if (Array.isArray(cacheArray)) {
      cacheArray.push(item);
    } else {
      console.warn("O cache não é um array.");
    }

    await redisClient.set(key, JSON.stringify(cacheArray), { EX: 3600 * 8 });
    console.log(`Item adicionado ao cache para ${key}`);
  }
};

const createCache = async (key: string, msgs: any): Promise<any> => {
  try {
    const newCacheArray = msgs;
    await redisClient.set(key, JSON.stringify(newCacheArray), { EX: 3600 * 8 });
    return newCacheArray;
  } catch {}
};

const removeCachePattern = async (pattern: string) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      redisClient.del(keys);
    }
  } catch (error) {
    console.error("Error removing cache pattern:", error);
  }
};

const updateCacheWithNewMessage = async (key: string, newMessage: any) => {
  const cachedData = await redisClient.get(key);

  if (cachedData) {
    const data = JSON.parse(cachedData);
    const { messages } = data
    const mIndex = messages.findIndex(message => message.id === newMessage.id)
    if (mIndex !== -1) {
      data['messages'][mIndex] = newMessage
    } else {
      data['messages'].push(newMessage);
      data['count'] = data['count'] + 1;
    }
    if (data['count'] > 20)
      messages.shift();

    await createCache(key, data);
  }
};

export {
  cacheMiddleware,
  clearCache,
  updateCache,
  getCacheItem,
  createCache,
  removeCachePattern,
  updateCacheWithNewMessage
};