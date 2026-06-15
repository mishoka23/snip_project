import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { loginUser } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { formatApiError } from "../utils/formatError";

function SignInModal({ onClose, onSwitchToSignUp }) {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    if (!formData.email.trim()) {
      return "Email is required.";
    }

    if (!formData.password) {
      return "Password is required.";
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

      const tokenData = await loginUser({
        username: formData.email.trim(),
        password: formData.password,
      });

      login(tokenData);
      onClose();
      navigate("/dashboard");
    } catch (error) {
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
            <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
            <p className="mt-1 text-sm text-gray-500">
              Access your dashboard and link history.
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
              autoComplete="current-password"
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
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          No account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignInModal;