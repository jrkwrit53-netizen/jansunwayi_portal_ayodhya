
import React from 'react';

interface FooterProps {
  currentLang: 'en' | 'hi';
}

const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  const translations = {
    en: {
      copyright: "© 2025 District Magistrate Office. All rights reserved.",
      disclaimer: "This is an official government portal for public grievance redressal.",
      contact: "Contact Us",
      help: "Help",
      privacy: "Privacy Policy"
    },
    hi: {
      copyright: "© 2025 जिलाधिकारी कार्यालय. सर्वाधिकार सुरक्षित.",
      disclaimer: "यह जन शिकायत निवारण के लिए एक आधिकारिक सरकारी पोर्टल है।",
      contact: "संपर्क करें",
      help: "सहायता",
      privacy: "गोपनीयता नीति"
    }
  };
  
  const t = translations[currentLang];
  
  return (
    <footer className="bg-jansunwayi-navy text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p>{t.copyright}</p>
            <p className="text-sm text-gray-300">{t.disclaimer}</p>
          </div>
          <div>
            <ul className="flex space-x-4 text-sm">
              <li><a href="#" className="hover:underline">{t.contact}</a></li>
              <li><a href="#" className="hover:underline">{t.help}</a></li>
              <li><a href="#" className="hover:underline">{t.privacy}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
