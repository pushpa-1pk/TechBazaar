import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className=" bg-f1f1f1 px-4 py-12 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-3xl font-bold text-slate-950">TechBazaar</h3>
            <p className="mt-5 max-w-sm text-lg leading-9 text-slate-700">
              Your one-stop shop for premium electronics and gadgets.
            </p>
            <div className="mt-6 flex gap-5 text-2xl text-slate-900">
              <FaFacebookF />
              <FaTwitter />
              <FaInstagram />
            </div>
          </div>

          <div>
            <h4 className="text-2xl font-semibold text-slate-950">Shop</h4>
            <div className="mt-5 space-y-2 text-lg text-slate-700">
              <p>All Products</p>
              <p>Laptops</p>
              <p>Phones</p>
              <p>Accessories</p>
              <p>Deals</p>
            </div>
          </div>

          <div>
            <h4 className="text-2xl font-semibold text-slate-950">Support</h4>
            <div className="mt-5 space-y-4 text-lg text-slate-700">
              <p>Contact Us</p>
              <p>FAQs</p>
              <p>Shipping & Returns</p>
              <p>Warranty</p>
            </div>
          </div>

          <div>
            <h4 className="text-2xl font-semibold text-slate-950">Newsletter</h4>
            <p className="mt-5 text-xl leading-9 text-slate-700">
              Subscribe to our newsletter for the latest products and deals.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-md outline-none focus:border-purple-500"
              />
              <button className="rounded-xl bg-purple-600 px-5 py-2 text-md font-medium text-white hover:bg-purple-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-slate-300 pt-8 text-lg text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p>� 2025 TechBazaar. All rights reserved.</p>
          <div className="flex gap-6">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
