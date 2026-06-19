import { describe, expect, test } from "vitest";
import { formatApiError } from "./formatError";

describe("formatApiError", () => {
    test("returns a network error when no response data exists", () => {
        const error = {};

        expect(formatApiError(error)).toBe("Network error. Check if the backend server is running.");
    });

    test("returns the backend message field", () => {
        const error = {
            response: {
                data: {
                    message: "Backend says no",
                },
            },
        };

        expect(formatApiError(error)).toBe("Backend says no");
    });

    test("returns the backend detail field", () => {
        const error = {
            response: {
                data: {
                    detail: "Authentication credentials were not provided.",
                },
            },
        };

        expect(formatApiError(error)).toBe(
            "Authentication credentials were not provided.");
    });

    test("returns the first field validation error", () => {
        const error = {
            response: {
                data: {
                    custom_alias: [
                        "Custom alias cannot be longer than 8 characters.",
                    ],
                },
            },
        };

        expect(formatApiError(error)).toBe(
            "Custom alias cannot be longer than 8 characters.");
    });

    test("returns a string field validation error", () => {
        const error = {
            response: {
                data: {
                    original_url: "Enter a valid URL.",
                },
            },
        };

        expect(formatApiError(error)).toBe("Enter a valid URL.");
    });

    test("formats a retry-after value in minutes for status 429", () => {
        const error = {
            response: {
                status: 429,
                data: {
                    detail: "Request was throttled.",
                },
                headers: {
                    "retry-after": "120",
                },
            },
        };

        expect(formatApiError(error)).toBe(
            "You have reached the anonymous link limit. Please try again in about 2 minutes, or sign in to continue.");
    });

    test("formats a retry-after value in hours for status 429", () => {
        const error = {
            response: {
                status: 429,
                data: {
                    detail: "Request was throttled.",
                },
                headers: {
                    "retry-after": "3600",
                },
            },
        };

        expect(formatApiError(error)).toBe(
            "You have reached the anonymous link limit. Please try again in about 1 hour, or sign in to continue."
        );
    });

    test("returns the fallback throttling message without retry-after", () => {
        const error = {
            response: {
                status: 429,
                data: {
                    detail: "Request was throttled.",
                },
                headers: {},
            },
        };

        expect(formatApiError(error)).toBe(
            "You have reached the anonymous link limit. Please try again later or sign in to continue.");
    });

    test("returns a generic fallback for an unknown response structure", () => {
        const error = {
            response: {
                data: {
                    unexpected: {
                        value: true,
                    },
                },
            },
        };

        expect(formatApiError(error)).toBe("Something went wrong. Please try again.");
    });
});