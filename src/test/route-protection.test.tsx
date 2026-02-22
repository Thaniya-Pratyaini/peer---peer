import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import App from "@/App";

describe("Route protection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirects mismatched role to login page", async () => {
    localStorage.setItem("mentor_connect_auth_token", "token");
    localStorage.setItem(
      "mentor_connect_auth_user",
      JSON.stringify({ id: "3", name: "Mentee", role: "Mentee" }),
    );

    window.history.pushState({}, "", "/admin");
    render(<App />);

    expect(await screen.findByText("Sign In")).toBeInTheDocument();
  });
});
