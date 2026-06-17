import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import ShortenForm from "./ShortenForm";

afterEach(() => {
    cleanup()
});

const createDeffered = () => {
    let resolve;
    let reject;

    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej
    });

    return { promise, resolve, reject }
};

describe("ShortenForm", () => {
    test("render the expected controls", () => {
        render(<ShortenForm onCreateLink={vi.fn} />);
        expect(screen.getByLabelText(/long url/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/custom alias optional/i)).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /shorten url/i})).toBeInTheDocument();
    });

    test("submit the entered url", async () => {
        const user = userEvent.setup();
        const onCreateLink = vi.fn().mockResolvedValue({ short_url: "http://127.0.0.1:8080/abc123"});
        render(<ShortenForm  onCreateLink={ onCreateLink}/>);
        await user.type(screen.getByLabelText(/long url/i), "https://example.com/long-url");
        await user.click(screen.getByRole("button", {name: /shorten url/i}));
        await waitFor(() => expect(onCreateLink).toHaveBeenCalledTimes(1));
        expect (onCreateLink).toHaveBeenCalledWith({original_url: "https://example.com/long-url"});
    });

    test("trim white spaces from custom url alias before submiting", async () => {
        const user = userEvent.setup();
        const onCreateLink = vi.fn().mockResolvedValue({ short_url: "http://127.0.0.1:8080/my-link" });
        render(<ShortenForm onCreateLink = {onCreateLink}/>);
        await user.type(screen.getByLabelText(/long url/i), "hhtp://example.com");
        await user.type(screen.getByLabelText(/custom alias optional/i), " my-link ");
        await user.click(screen.getByRole("button", {name: /shorten url/i}));
        await waitFor(() => expect(onCreateLink).toHaveBeenCalledTimes(1));
        expect (onCreateLink).toHaveBeenCalledWith({original_url: "hhtp://example.com", custom_alias: "my-link"});
    });

    test("show the created short link and cleared the form after success", async () => {
        const user = userEvent.setup();
        const onCreateLink = vi.fn().mockResolvedValue({ short_url: "http://127.0.0.1:8080/abc123" });
        render(<ShortenForm onCreateLink={onCreateLink}/>);
        await user.type(screen.getByLabelText(/long url/i), "hhtp://example.com");
        await user.type(screen.getByLabelText(/custom alias optional/i), "my-link");
        await user.click(screen.getByRole("button", {name: /shorten url/i}));
        expect(await screen.findByText(/created: http:\/\/127\.0\.0\.1:8080\/abc123/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/long url/i), "");
        expect(screen.getByLabelText(/custom alias/i), "");
    });

    test("shows a backend error when the request fails", async () => {
        const user = userEvent.setup();
        const onCreateLink = vi.fn().mockRejectedValue({ response: { data: { message: "Backend says no" } } });
        render(<ShortenForm onCreateLink={onCreateLink}/>);
        await user.type(screen.getByLabelText(/long url/i), "hhtp://example.com");
        await user.click(screen.getByRole("button", {name: /shorten url/i}));
        expect(await screen.findByText(/backend says no/i)).toBeInTheDocument();
        expect(onCreateLink).toHaveBeenCalledTimes(1);
    });

    test("rejects a custom alias that is longer than 8 characters", async () => {
        const user = userEvent.setup();
        const onCreateLink = vi.fn().mockResolvedValue({ short_url: "http://127.0.0.1:8080/abc123" });
        render(<ShortenForm onCreateLink={onCreateLink}/>);
        await user.type(screen.getByLabelText(/long url/i), "hhtp://example.com");
        await user.type(screen.getByLabelText(/custom alias optional/i), "longertThan8chars");
        await user.click(screen.getByRole("button", {name: /shorten url/i}));
        expect(await screen.findByText("Custom alias cannot be longer than 8 characters.")).toBeInTheDocument();
        expect(onCreateLink).not.toHaveBeenCalled();
    });

    test("show loading state while waiting for API response", async () => {
        const user = userEvent.setup();
        const deffered = createDeffered();
        const onCreateLink = vi.fn( () =>  deffered.promise );
        render(<ShortenForm onCreateLink={onCreateLink}/>);
        await user.type(screen.getByLabelText(/long url/i), "https://example.com"); // Type the long URL.
        await user.click(screen.getByRole("button", { name: /shorten url/i })); 
        expect(screen.getByRole("button", { name: /creating\.\.\./i })).toBeDisabled();
        deffered.resolve({ short_url: "http://127.0.0.1:8080/loading" });
        expect(await screen.findByText(/created: http:\/\/127\.0\.0\.1:8080\/loading/i)).toBeInTheDocument();
    });
});