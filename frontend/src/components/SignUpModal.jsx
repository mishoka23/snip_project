import { useState } from "react";

import { loginUser, registerUser } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { formatApiError } from "../api/formatError";

function SignUpModal({ onClose, onSwitchToSignIn }) {
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Name is required.";
    }

    if (!formData.email.trim()) {
      return "Email is required.";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (formData.password !== formData.password_confirm) {
      return "Passwords do not match.";
    }

    return "";
  };

    const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
        setErrorMessage(validationError);
        return;
    }

    try {
        setIsSubmitting(true);

        await registerUser({
        username: formData.email.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
        });

        const tokenData = await loginUser({
        username: formData.email.trim(),
        password: formData.password,
        });

        login(tokenData);
        onClose();
    } catch (error) {
        console.log("REGISTER ERROR RESPONSE:", error.response?.data);
        setErrorMessage(formatApiError(error));
    } finally {
        setIsSubmitting(false);
    }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create Account
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create an account to manage your links.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={formData.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              type="password"
              value={formData.password_confirm}
              onChange={(event) =>
                updateField("password_confirm", event.target.value)
              }
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoComplete="new-password"
            />
          </div>

          {errorMessage && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignUpModal;