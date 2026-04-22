"use server";

import { prisma } from "@repo/database";

type LogLevel = "info" | "warn" | "error";

interface LogPaymentEventInput {
  scope: string;
  level: LogLevel;
  event: string;
  data?: unknown;
  error?: unknown;
}

function serializeError(error: unknown) {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: (error as any).cause,
    };
  }
  if (typeof error === "object") {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return String(error);
    }
  }
  return String(error);
}

export async function logPaymentEvent(input: LogPaymentEventInput) {
  const payload = {
    scope: input.scope,
    level: input.level,
    event: input.event,
    data: input.data ?? null,
    error: serializeError(input.error) ?? null,
    loggedAt: new Date().toISOString(),
  };

  const consoleMethod =
    input.level === "error"
      ? console.error
      : input.level === "warn"
        ? console.warn
        : console.log;
  consoleMethod(`[payment:${input.scope}] ${input.event}`, payload);

  try {
    await prisma.log.create({
      data: { content: payload as any },
    });
  } catch (dbError) {
    console.error("logPaymentEvent DB write failed:", dbError);
  }
}
