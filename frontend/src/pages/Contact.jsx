import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import Footer from "../components/Footer";

const contactCards = [
  {
    icon: FaEnvelope,
    title: "Email Support",
    detail: "support@techbazaar.com",
    helper: "Reach us for product questions, returns, and account help.",
  },
  {
    icon: FaPhoneAlt,
    title: "Phone Support",
    detail: "+91-9322323454",
    helper: "Talk to our team for urgent order and technical support needs.",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Office Address",
    detail: "TechBazaar Pvt. Ltd. Sitabuldi, Nagpur, India",
    helper: "Our headquarters powers support, sourcing, and customer success operations.",
  },
];

const subjectOptions = [
  "Technical Support",
  "Order Status",
  "Business Inquiry",
  "Returns & Warranty",
  "General Question",
];

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: subjectOptions[0],
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData((currentData) => ({
      ...currentData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setFormData({
      fullName: "",
      email: "",
      subject: subjectOptions[0],
      message: "",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-600">
            Contact Us
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            We are here to help with every device, order, and question.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Reach the TechBazaar team for technical support, order updates, partnership inquiries, or expert help choosing the right electronics for your needs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {contactCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-2xl text-purple-600">
                  <Icon />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-950">{card.title}</h2>
                <p className="mt-3 text-lg font-medium text-slate-900">{card.detail}</p>
                <p className="mt-4 leading-7 text-slate-600">{card.helper}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-600">
                Send a Message
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Talk to our support team</h2>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-medium text-slate-700">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-600"
                >
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-sm">
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-600">
                Store Location
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Visit our Nagpur location</h2>
            </div>

            <div className="h-[520px] bg-slate-200">
              <iframe
                title="ElectraCore Headquarters"
                src="https://www.google.com/maps?q=Nagpur%2C%20Maharashtra%2C%20India&z=12&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-600">
            Common Questions
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Need a faster answer?</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white px-6 py-3 font-semibold text-purple-600 transition hover:bg-purple-50"
            >
              Track Order
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
            >
              Warranty Policy
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

