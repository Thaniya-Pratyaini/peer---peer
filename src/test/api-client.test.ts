import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMentors, getTodos, setMeetLink } from "@/services/api";

describe("API client role routes", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("calls admin endpoint with bearer token", async () => {
    localStorage.setItem("mentor_connect_auth_token", "admin-token");
    localStorage.setItem(
      "mentor_connect_auth_user",
      JSON.stringify({ id: "1", name: "Admin", role: "Admin" }),
    );

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([{ id: 2, name: "Mentor", role: "mentor" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await getMentors();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/admin/mentors"),
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer admin-token");
  });

  it("calls mentor endpoint with bearer token", async () => {
    localStorage.setItem("mentor_connect_auth_token", "mentor-token");
    localStorage.setItem(
      "mentor_connect_auth_user",
      JSON.stringify({ id: "2", name: "Mentor", role: "Mentor" }),
    );

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ meet_link: "https://meet.google.com/abc" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await setMeetLink("2", "https://meet.google.com/abc");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/mentor/2/meet-link"),
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("calls mentee endpoint with bearer token", async () => {
    localStorage.setItem("mentor_connect_auth_token", "mentee-token");
    localStorage.setItem(
      "mentor_connect_auth_user",
      JSON.stringify({ id: "3", name: "Mentee", role: "Mentee" }),
    );

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 1,
            title: "Task",
            description: "Do it",
            due_date: "2026-03-01",
            completed: false,
            mentee_id: 3,
          },
        ]),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await getTodos("3");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/mentee/3/todos"),
      expect.objectContaining({}),
    );
  });
});
