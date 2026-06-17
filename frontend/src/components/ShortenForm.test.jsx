import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import ShortenForm from "./ShortenForm";

afterEach(() => {
    cleanup()
});

describe("ShortenForm", () => {
  test("submits the entered URL", async () => {
    const user = userEvent.setup();

    const onCreateLink = vi.fn().mockResolvedValue({
      short_url: "http://127.0.0.1:8080/abc123",
    });

    render(<ShortenForm onCreateLink={onCreateLink} />);

    await user.type(
      screen.getByLabelText(/long url/i),
      "https://example.com/long-url",
    );

    await user.click(
      screen.getByRole("button", { name: /shorten url/i }),
    );

    expect(onCreateLink).toHaveBeenCalledWith({
      original_url: "https://example.com/long-url",
    });
  });

  test("submits a custom alias when provided", async () => {
    const user = userEvent.setup();

    const onCreateLink = vi.fn().mockResolvedValue({
      short_url: "http://127.0.0.1:8080/my-link",
    });

    render(<ShortenForm onCreateLink={onCreateLink} />);

    await user.type(
      screen.getByLabelText(/long url/i),
      "https://example.com",
    );

    await user.type(
      screen.getByLabelText(/custom alias/i),
      "my-link",
    );

    await user.click(
      screen.getByRole("button", { name: /shorten url/i }),
    );

    expect(onCreateLink).toHaveBeenCalledWith({
      original_url: "https://example.com",
      custom_alias: "my-link",
    });
  });

  test("shows the created short URL", async () => {
    const user = userEvent.setup();

    const onCreateLink = vi.fn().mockResolvedValue({
      short_url: "http://127.0.0.1:8080/abc123",
    });

    render(<ShortenForm onCreateLink={onCreateLink} />);

    await user.type(
      screen.getByLabelText(/long url/i),
      "https://example.com",
    );

    await user.click(
      screen.getByRole("button", { name: /shorten url/i }),
    );

    expect(
      await screen.findByText(
        /created: http:\/\/127\.0\.0\.1:8080\/abc123/i,
      ),
    ).toBeInTheDocument();
  });

  test("rejects a custom alias longer than 8 characters", async () => {
    const user = userEvent.setup();
    const onCreateLink = vi.fn();

    render(<ShortenForm onCreateLink={onCreateLink} />);

    await user.type(
      screen.getByLabelText(/long url/i),
      "https://example.com",
    );

    await user.type(
      screen.getByLabelText(/custom alias/i),
      "toolongalias",
    );

    await user.click(
      screen.getByRole("button", { name: /shorten url/i }),
    );

    expect(
      screen.getByText(
        "Custom alias cannot be longer than 8 characters.",
      ),
    ).toBeInTheDocument();

    expect(onCreateLink).not.toHaveBeenCalled();
  });
});
