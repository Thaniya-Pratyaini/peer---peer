import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import Login from "@/pages/Login";
import { login as loginApi } from "@/services/api";

vi.mock("@/services/api", () => ({
  login: vi.fn(),
}));

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("submits name, role and password", async () => {
    vi.mocked(loginApi).mockResolvedValue({
      id: "2",
      name: "Mentor",
      role: "Mentor",
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your name"), { target: { value: "Mentor" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Mentor" } });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), { target: { value: "mentor123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginApi).toHaveBeenCalledWith("Mentor", "Mentor", "mentor123");
    });
  });

  it("shows backend errors", async () => {
    vi.mocked(loginApi).mockRejectedValue(new Error("Invalid credentials"));

    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your name"), { target: { value: "Mentor" } });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
