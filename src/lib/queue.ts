import { Queue, Worker, type Processor } from "bullmq";
import { redis } from "./redis";

export function createQueue(name: string) {
  // Cast needed: ioredis version mismatch between top-level and bullmq's bundled copy
  return new Queue(name, { connection: redis as never });
}

export function createWorker<T>(name: string, processor: Processor<T>) {
  return new Worker<T>(name, processor, { connection: redis as never });
}

export const agentQueue = createQueue("agent-pipeline");
