
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

const NotFound = () => {
  const location = useLocation();
  const { currentLang } = useApp();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const translations = {
    en: {
      title: "404",
      message: "Oops! Page not found",
      returnHome: "Return to Home"
    },
    hi: {
      title: "404",
      message: "उफ़! पेज नहीं मिला",
      returnHome: "होम पेज पर वापस जाएं"
    }
  };
  
  const t = translations[currentLang];

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-jansunwayi-blue mb-4">{t.title}</h1>
        <p className="text-xl text-jansunwayi-darkgray mb-8">{t.message}</p>
        <Link to="/" className="btn-primary inline-block">
          {t.returnHome}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
