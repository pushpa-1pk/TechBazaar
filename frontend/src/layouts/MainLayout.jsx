import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import HeroSlider from "../components/HeroSlider";
import ShopByCategory from "../components/ShopByCategory";
import AuthModal from "../components/AuthModal";

export default function MainLayout({ children }) {
  const [authMode, setAuthMode] = useState(null);
  const location = useLocation();
  const hideHomeSections = location.pathname !== "/";

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
  };

  const closeAuthModal = () => {
    setAuthMode(null);
  };

  return (
    <>
      <Navbar openAuthModal={openAuthModal} />
      <div className="pt-16">
        {!hideHomeSections && <HeroSlider />}
        {!hideHomeSections && <ShopByCategory />}
        <main>{children}</main>
      </div>
      <AuthModal
        isOpen={Boolean(authMode)}
        initialMode={authMode || "login"}
        onClose={closeAuthModal}
      />
    </>
  );
}


