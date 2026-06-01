import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBolt,
  FaBoxOpen,
  FaCheckCircle,
  FaHeadset,
  FaMicrochip,
  FaRocket,
  FaShieldAlt,
} from "react-icons/fa";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import pushpa from "../assets/pushpa.jpg";
import second from "../assets/second.png";
import third from "../assets/third.jpg";
import hero from "../assets/hero.jpg";

const values = [
  {
    icon: FaRocket,
    title: "Innovation",
    description:
      "We stay ahead of fast-moving technology trends so customers can discover devices that feel future-ready.",
  },
  {
    icon: FaShieldAlt,
    title: "Quality Assurance",
    description:
      "Every product category is reviewed for authenticity, performance, reliability, and long-term value before it earns a place on our store.",
  },
  {
    icon: FaHeadset,
    title: "Customer Centricity",
    description:
      "From product selection to after-sales support, every decision is shaped around clarity, trust, and convenience.",
  },
];

const features = [
  {
    icon: FaBolt,
    title: "Free Express Shipping",
    description: "Quick and dependable delivery on the latest devices and everyday essentials.",
  },
  {
    icon: FaCheckCircle,
    title: "Verified Product Quality",
    description: "Only trusted inventory, backed by careful checks and transparent product standards.",
  },
  {
    icon: FaHeadset,
    title: "24/7 Tech Support",
    description: "Real help from people who understand electronics, setup issues, and buying decisions.",
  },
  {
    icon: FaBoxOpen,
    title: "Simple Warranty Support",
    description: "Clear guidance for returns, replacements, and warranty support when you need it.",
  },
];

const leaders = [
  {
    name: "Pushpa Kaithal",
    title: "Developer",
    quote:
      "I love building technology experiences that feel modern, useful, and easy for people to trust every day.",
    image: pushpa,
  },
  {
    name: "Jaya Patel",
    title: "Visionary Leader",
    quote:
      "We care deeply about performance, but we care even more about reliability in the real world.",
    image: second, 
  },
  {
    name: "Jiya Sharma",
    title: "Customer Experience Director",
    quote:
      "Every customer should feel supported before purchase, during setup, and long after delivery.",
    image: third,
  }
];

export default function About() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-4 rounded-full border border-slate-200 bg-slate-100 px-5 py-3 shadow-sm">
              <img src={logo} alt="TechBazaar Logo" className="h-11 w-auto object-contain" />
              <div className="leading-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Brand Story
                </p>
                <p className="mt-2 text-2xl font-bold">
                  <span className="text-slate-950">Tech</span>
                  <span className="text-purple-600">Bazaar</span>
                </p>
              </div>
            </div>

            <p className="mt-8 text-lg font-bold uppercase tracking-[0.3em] text-purple-600">
              About Us
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Our Mission: Connecting You to the Future
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              TechBazaar was built for people who love great electronics but want to buy with confidence. We bring together premium devices, trusted guidance, and dependable support so every purchase feels exciting, informed, and secure.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Innovation</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Quality Assurance</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Customer Centricity</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100 shadow-sm">
            <img
              src={hero}
              alt="TechBazaar team collaborating on future technology"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-lg font-bold uppercase tracking-[0.3em] text-purple-600">Our Story</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">A company born from a passion for electronics</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              TechBazaar began with a simple idea: electronics shopping should feel exciting, not uncertain. We saw how often customers had to choose between variety, trust, and expert guidance, so we built a company focused on delivering all three together. From mobile devices and laptops to accessories and smart tech, our catalog reflects a genuine passion for products that improve daily life.
            </p>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              That foundation still guides us today. We invest in smart product curation, honest information, and support that helps customers make decisions with confidence rather than confusion.
            </p>
          </div>

          <div className="grid gap-4">
            {values.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3b82f6]/10 text-2xl text-purple-600">
                      <Icon />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-950">{item.title}</h3>
                  </div>
                  <p className="mt-4 leading-8 text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-slate-950 px-6 py-14 text-white sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#60a5fa]">Why Choose Us</p>
            <h2 className="mt-3 text-3xl font-semibold">Built for trust, speed, and everyday reliability</h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[24px] border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-[#3b82f6]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3b82f6]/15 text-2xl text-[#60a5fa]">
                    <Icon />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-slate-300">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-bold uppercase tracking-[0.3em] text-purple-600">Our Team</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Meet the people behind TechBazaar</h2>
          </div>
          <p className="max-w-2xl text-slate-600">
            Our leadership team blends product expertise, engineering rigor, and customer-first thinking to keep the company grounded and future-ready.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {leaders.map((member) => (
            <div key={member.name} className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="overflow-hidden bg-slate-100">
                <img src={member.image} alt={member.name} className="h-72 w-full object-cover transition duration-300 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-950">{member.name}</h3>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.25em] text-purple-600">{member.title}</p>
                <p className="mt-5 leading-8 text-slate-600">"{member.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-600">Our Commitment to Technology</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Powered by leading brands and rigorous standards</h2>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-600">
            TechBazaar partners with globally respected technology brands such as Sony, Samsung, and other trusted leaders to deliver authentic, high-performance products. Beyond brand partnerships, we believe trust comes from process, which is why every featured product category is evaluated with a strong focus on quality checks, performance consistency, compatibility, and long-term customer value.
          </p>
          <div className="mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-3 rounded-full bg-purple-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-purple-700"
            >
              Explore Our Latest Devices
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

