import { afterEach, describe, expect, it, vi } from "vitest";

import {
  deleteKnowledgeSource,
  getKnowledgeSource,
  uploadKnowledgeDocument,
} from "./productApi";

describe("productApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads knowledge documents as FormData", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ message: "ok" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["# Rules"], "rules.md", { type: "text/markdown" });

    await uploadKnowledgeDocument("access-token", file);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/knowledge/upload",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
        headers: {
          Authorization: "Bearer access-token",
        },
      }),
    );
  });

  it("loads a knowledge source by id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: "rules.md",
        name: "rules.md",
        type: "markdown",
        last_updated: "2026-04-27T00:00:00Z",
        content: "# Rules",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getKnowledgeSource("access-token", "rules.md");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/knowledge/sources/rules.md",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("deletes a knowledge source by id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockRejectedValue(new Error("No body")),
    });
    vi.stubGlobal("fetch", fetchMock);

    await deleteKnowledgeSource("access-token", "rules.md");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/knowledge/sources/rules.md",
      expect.objectContaining({
        method: "DELETE",
        headers: {
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });
});
