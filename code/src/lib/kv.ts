import { Redis } from '@upstash/redis';

/** Upstash Redis client (HTTP, stateless). */
export const redis = Redis.fromEnv();
