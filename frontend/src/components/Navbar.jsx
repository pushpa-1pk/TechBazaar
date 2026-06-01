import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import logo from "../assets/logo.png";
import {
  FaBars,
  FaHeart,
  FaShoppingCart,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar({ openAuthModal }) {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const closeMenus = () => {
      setOpenProfileMenu(false);
    };

    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpenMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleProtectedNav = (path) => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    navigate(path);
    setOpenProfileMenu(false);
    setOpenMobileMenu(false);
  };

  const handleSearch = () => {
    const query = searchValue.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setOpenMobileMenu(false);
  };

  const handleProfileButtonClick = (event) => {
    event.stopPropagation();

    if (!user) {
      openAuthModal("login");
      return;
    }

    setOpenProfileMenu((current) => !current);
  };

  const closeAllMenus = () => {
    setOpenProfileMenu(false);
    setOpenMobileMenu(false);
  };

  return (
    <>
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-slate-200 bg-gray-100/95 px-4 py-3 text-black shadow backdrop-blur md:px-6 md:py-3 md:text-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenMobileMenu(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-700 md:hidden"
            >
              <FaBars />
            </button>

            <Link to="/" className="flex min-w-0 items-center" onClick={closeAllMenus}>
              <img
                src={logo}
                alt="TechBazaar Logo"
                className="h-8 w-auto object-contain md:mb-1.5 md:h-12"
              />
              <span className="ml-2 text-lg font-bold sm:text-xl md:text-2xl">
                <span className="text-black">Tech</span>
                <span className="text-purple-600">Bazaar</span>
              </span>
            </Link>

            <div className="ml-3 hidden items-center space-x-5 font-normal md:flex">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="hover:text-purple-600">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={handleProfileButtonClick}
                className="text-4xl text-purple-600 transition hover:text-purple-800"
              >
                <FaUserCircle />
              </button>

              {openProfileMenu && (
                <div className="absolute right-0 z-50 mt-3 w-56 rounded-lg border bg-white py-2 shadow-lg">
                  {user ? (
                    <>
                      <div className="border-b px-4 py-2 text-sm text-gray-600">
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-xs capitalize text-purple-600">{user.role}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleProtectedNav("/wishlist")}
                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-gray-100"
                      >
                        <span>Wishlist</span>
                        <span className="text-sm text-slate-500">{wishlistItems.length}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProtectedNav("/cart")}
                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-gray-100"
                      >
                        <span>Cart</span>
                        <span className="text-sm text-slate-500">{cartItems.length}</span>
                      </button>

                      {user.role === "seller" ? (
                        <Link
                          to="/seller/dashboard"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={closeAllMenus}
                        >
                          Seller Dashboard
                        </Link>
                      ) : (
                        <Link
                          to="/profile"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={closeAllMenus}
                        >
                          Profile
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          closeAllMenus();
                        }}
                        className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            <div className="hidden items-center space-x-3 md:flex">
              <input
                type="text"
                placeholder="Search products..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-64 rounded border px-3 py-1 outline-none"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="rounded border border-purple-600 px-4 py-1 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => handleProtectedNav("/wishlist")}
                className="relative text-2xl text-purple-600 transition hover:text-purple-800"
              >
                <FaHeart />
                {user && wishlistItems.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleProtectedNav("/cart")}
                className="relative text-2xl text-purple-600 transition hover:text-purple-800"
              >
                <FaShoppingCart />
                {user && cartItems.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-purple-600 px-1 text-[11px] font-semibold text-white">
                    {cartItems.length}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleProfileButtonClick}
                  className="text-4xl text-purple-600 transition hover:text-purple-800"
                >
                  <FaUserCircle />
                </button>

                {openProfileMenu && (
                  <div className="absolute right-0 z-50 mt-3 w-56 rounded-lg border bg-white py-2 shadow-lg">
                    {user ? (
                      <>
                        <div className="border-b px-4 py-2 text-sm text-gray-600">
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-xs capitalize text-purple-600">{user.role}</div>
                        </div>

                        {user.role === "seller" ? (
                          <Link
                            to="/seller/dashboard"
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={closeAllMenus}
                          >
                            Seller Dashboard
                          </Link>
                        ) : (
                          <Link
                            to="/profile"
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={closeAllMenus}
                          >
                            Profile
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={async () => {
                            await logout();
                            closeAllMenus();
                          }}
                          className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {openMobileMenu && (
        <div className="fixed inset-0 z-40 bg-slate-950/45 md:hidden">
          <div className="h-full w-[82%] max-w-sm bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center" onClick={closeAllMenus}>
                <img src={logo} alt="TechBazaar Logo" className="h-8 w-auto object-contain" />
                <span className="ml-2 text-xl font-bold">
                  <span className="text-black">Tech</span>
                  <span className="text-purple-600">Bazaar</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setOpenMobileMenu(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="w-full rounded-2xl bg-purple-600 px-4 py-3 font-semibold text-white"
              >
                Search
              </button>
            </div>

            <div className="mt-8 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeAllMenus}
                  className="block rounded-2xl px-4 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
