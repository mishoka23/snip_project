import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import LinkTable from "./LinkTable";

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

const links = [
    {
        id: 1,
        original_url: "https://example.com/this-is-a-long-original-url",
        short_url: "http://127.0.0.1:8080/abc123",
        slug: "abc123",
        click_count: 12,
        created_at: "2026-06-18T10:30:00Z",
    },
    {
        id: 2,
        original_url: "https://openai.com",
        short_url: "http://127.0.0.1:8080/test",
        slug: "test",
        click_count: 3,
        created_at: "2026-06-17T08:15:00Z",
    },
];

describe("LinkTable", () => {
    test("renders the table headings", () => {
        render(<LinkTable links={links} onDelete={vi.fn()} />);

        expect(screen.getByRole("columnheader", { name: /short url/i })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: /original url/i })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: /clicks/i })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: /created/i })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: /actions/i })).toBeInTheDocument();
    });

    test("renders link data", () => {
        render(<LinkTable links={links} onDelete={vi.fn()} />);

        expect(screen.getByText("http://127.0.0.1:8080/abc123")).toBeInTheDocument();
        expect(screen.getByText("https://openai.com")).toBeInTheDocument();
        expect(screen.getByText("12")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    test("renders one row for each link", () => {
        render(<LinkTable links={links} onDelete={vi.fn()} />);

        const rows = screen.getAllByRole("row");

        // One header row and two data rows.
        expect(rows).toHaveLength(3);
    });

    test("shows an empty state when no links exist", () => {
        render(<LinkTable links={[]} onDelete={vi.fn()} />);

        expect(screen.getByText(/no links/i)).toBeInTheDocument();
    });

    test("copies the short URL to the clipboard", async () => {
        const user = userEvent.setup();
        const writeText = vi.fn().mockResolvedValue();

        Object.defineProperty(navigator, "clipboard", {
            value: {writeText, }, configurable: true});

        render(<LinkTable links={links} onDelete={vi.fn()} />);
        const copyButtons = screen.getAllByRole("button", {name: /copy/i,});

        await user.click(copyButtons[0]);
        expect(writeText).toHaveBeenCalledWith("http://127.0.0.1:8080/abc123");
    });

    test("does not delete a link when confirmation is cancelled", async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();

        vi.spyOn(window, "confirm").mockReturnValue(false);
        render(<LinkTable links={links} onDelete={onDelete}/>);
        const deleteButtons = screen.getAllByRole("button", {name: /delete/i,});

        await user.click(deleteButtons[0]);
        expect(onDelete).not.toHaveBeenCalled();
    });
});