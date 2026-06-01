import { Link } from "react-router-dom";

const categories = [
  {
    name: "Laptops",
    image: "/images/laptop.jpeg",
    link: "/products?category=laptop",
  },
  {
    name: "Mobiles",
    image: "/images/phone.jpeg",
    link: "/products?category=mobile",
  },
  {
    name: "AirPods",
    image: "/images/airpod3.jpeg",
    link: "/products?category=airpod",
  },
  {
    name: "Headphones",
    image: "/images/head2.jpeg",
    link: "/products?category=headphone",
  },
  {
    name: "TV",
    image: "/images/tv.jpeg",
    link: "/products?category=tv",
  },
  {
    name: "Speakers",
    image: "/images/speaker6.jpeg",
    link: "/products?category=speaker",
  },
  {
    name: "Camera",
    image: "/images/camera2.jpeg",
    link: "/products?category=camera",
  },
  {
    name: "watch",
    image: "/images/watch3.jpeg",
    link: "/products?category=watch",
  },
  {
    name: "IT peripherals",
    image: "/images/monitor5.jpeg",
    link: "/products?category=it-peripherals",
  },
  {
    name: "Tablets",
    image: "/images/tablet.jpeg",
    link: "/products?category=tablets",
  },
  {
    name: "Accessories",
    image: "/images/accessories.jpeg",
    link: "/products?category=accessories",
  },
  {
    name: "Smart Home & Appliances",
    image: "/images/ac2.jpeg",
    link: "/products?category=smart-home-appliances",
  },
];

export default function ShopByCategory() {
  return (
    <section>
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold">Shop By Category</h2>
        <p className="mt-2 text-gray-500">
          Explore products by category
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
        {categories.map((cat, index) => (
          <Link
            to={cat.link}
            key={index}
            className="flex flex-col items-center group"
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 shadow-md transition duration-300 group-hover:scale-110 group-hover:bg-purple-100">
              <img
                src={cat.image}
                alt={cat.name}
                className="h-16 w-16 rounded-2xl object-contain"
              />
            </div>
            <p className="mt-4 text-center font-medium transition group-hover:text-purple-600">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

