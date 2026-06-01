import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-[850px] max-w-full rounded-xl shadow-2xl flex overflow-hidden">
        <div className="w-1/2 hidden md:flex items-center justify-center border-r bg-gray-50">
          <h1 className="text-4xl font-bold">
            Tech<span className="text-purple-600">Bazaar</span>
          </h1>
        </div>

        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-semibold mb-6">Create an account</h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={form.name}
              placeholder="Enter Name"
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
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
                <div className="text-xs text-gray-500">Shop and checkout products</div>
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

            <input
              type="email"
              value={form.email}
              placeholder="Email"
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <input
              type="password"
              value={form.password}
              placeholder="Password"
              minLength={6}
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

