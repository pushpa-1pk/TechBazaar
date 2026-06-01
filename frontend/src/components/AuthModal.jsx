import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, initialMode = "login", onClose }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsLogin(initialMode === "login");
    setForm({ name: "", email: "", password: "", role: "buyer" });
    setError("");
    setLoading(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login({
          email: form.email,
          password: form.password,
        });
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }

      onClose();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-[850px] max-w-[95vw] rounded-xl shadow-2xl flex overflow-hidden relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl hover:text-red-500"
          aria-label="Close"
        >
          X
        </button>

        <div className="w-1/2 hidden md:flex items-center justify-center border-r bg-gray-50">
          <h1 className="text-4xl font-bold">
            Tech<span className="text-purple-600">Bazaar</span>
          </h1>
        </div>

        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-semibold mb-6">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </h2>

          {error && (
            <div className="bg-red-100 text-red-600 px-3 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <input
                  type="text"
                  required
                  placeholder="Enter Name"
                  className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "buyer" })}
                    className={`rounded-md border px-4 py-3 text-left transition ${
                      form.role === "buyer"
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-300 hover:border-purple-400"
                    }`}
                  >
                    <div className="font-medium">Buyer</div>
                    <div className="text-xs text-gray-500">Shop and place orders</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "seller" })}
                    className={`rounded-md border px-4 py-3 text-left transition ${
                      form.role === "seller"
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-300 hover:border-purple-400"
                    }`}
                  >
                    <div className="font-medium">Seller</div>
                    <div className="text-xs text-gray-500">Add and manage products</div>
                  </button>
                </div>
              </>
            )}

            <input
              type="email"
              required
              placeholder="Email"
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-purple-600 font-medium ml-1"
            >
              {isLogin ? "Create an Account" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
