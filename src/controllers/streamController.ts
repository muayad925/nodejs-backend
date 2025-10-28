// src/controllers/streamController.ts
import type { Request, Response } from "express";

type Client = {
  res: Response;
  filters: Record<string, string>;
};

export class StreamController {
  static clients: Client[] = [];

  static connect(req: Request, res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const filters = req.query as Record<string, string>; // e.g. { league: "42", type: "MATCH_UPDATE" }
    const client: Client = { res, filters };
    StreamController.clients.push(client);

    req.on("close", () => {
      StreamController.clients = StreamController.clients.filter(
        (c) => c !== client
      );
    });
  }

  static broadcast(data: any) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;

    for (const { res, filters } of StreamController.clients) {
      // --- simple filter matching ---
      if (StreamController.shouldSend(data, filters)) {
        res.write(payload);
      }
    }
  }

  private static shouldSend(
    data: any,
    filters: Record<string, string>
  ): boolean {
    // no filters → send everything
    if (!Object.keys(filters).length) return true;

    // basic example: if any filter key/value matches event data
    return Object.entries(filters).every(
      ([key, val]) => String(data[key]) === val
    );
  }
}
