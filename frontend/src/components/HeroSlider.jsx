import { useEffect, useState } from "react";

const slides = [
   {
    image: "/images/k3.jpeg",
    title: "Welcome to TechBazaar",
    heading: "Your One-Stop Electronic Market",
    desc: "Buy everything about electronics at unbeatable prices.",
    button: "Shop Now",
  },
  {
    image: "/images/slide1.png",
    title: "New Arrivals",
    heading: "Incredible Prices on All Your Favorite Items",
    desc: "Premium accessories & consoles available now.",
    button: "Explore Now",
  },
  {
    image: "/images/k2.jpeg",
    title: "Holiday Deals",
    heading: "Up to 30% off",
    desc: "Selected Smartphone Brands",
    button: "Shop Now",
  },
  {
    image: "/images/k4.png",
    title: "Gaming Collection",
    heading: "Level Up Your Setup",
    desc: "Premium accessories & consoles available now.",
    button: "Discover",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () =>
    setCurrent((prev) => (prev + 1) % slides.length);

  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[95vh] overflow-hidden ">

      {/* Slides Container */}
      <div
        className="flex transition-transform duration-800 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="min-w-full h-[85vh] relative"
          >
            <img
              src={slide.image}
              alt="slide"
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 "></div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="ml-20 max-w-xl text-black">
                <p className="text-lg mb-2">{slide.title}</p>
                <h1 className="text-5xl font-bold mb-4">
                  {slide.heading}
                </h1>
                <p className="mb-6 text-lg">{slide.desc}</p>
                <button className="bg-purple-600 px-6 py-3 rounded-full hover:bg-purple-700 transition">
                  {slide.button}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-3xl"
      >
        ❮
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-5 top-1/2 -translate-y-1/2 text-white text-3xl"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-3 w-3 rounded-full cursor-pointer ${
              current === index
                ? "bg-white"
                : "bg-white/50"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
