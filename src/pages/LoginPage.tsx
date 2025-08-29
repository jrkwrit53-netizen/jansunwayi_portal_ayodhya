import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const { login, currentLang } = useApp();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const translations = {
    en: {
      title: "Ayodhya Court Case Portal",
      subtitle: "Login to access the portal",
      emailPlaceholder: "Email / Phone number",
      passwordPlaceholder: "Password",
      loginButton: "Login",
      forgotPassword: "Forgot Password?",
      admin: "Admin",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      loginSuccess: "Login successful",
      loginError: "Invalid credentials. Please try again."
    },
    hi: {
      title: "अयोध्या वाद प्रकरण पोर्टल",
      subtitle: "पोर्टल का उपयोग करने के लिए लॉगिन करें",
      emailPlaceholder: "ईमेल / फोन नंबर",
      passwordPlaceholder: "पासवर्ड",
      loginButton: "लॉगिन",
      forgotPassword: "पासवर्ड भूल गए?",
      admin: "प्रशासक",
      emailRequired: "ईमेल आवश्यक है",
      passwordRequired: "पासवर्ड आवश्यक है",
      loginSuccess: "लॉगिन सफल",
      loginError: "अमान्य क्रेडेंशियल्स। कृपया पुनः प्रयास करें।"
    }
  };
  
  const t = translations[currentLang];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t.emailRequired);
      return;
    }

    if (!password) {
      toast.error(t.passwordRequired);
      return;
    }

    try {
      await login(email, password, 'admin');
      toast.success(t.loginSuccess);
      navigate('/reports'); // Redirect to reports page after successful login
    } catch (error) {
      toast.error(t.loginError);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-jansunwayi-navy">{t.title}</h1>
          <p className="text-jansunwayi-darkgray">{t.subtitle}</p>
        </div>
        
        <div className="mb-6">
          <div className="flex rounded-md overflow-hidden border">
            <button
              type="button"
              className="flex-1 py-2 text-center bg-jansunwayi-blue text-white cursor-default"
              disabled
            >
              {t.admin}
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="input-field"
              />
            </div>
            
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="input-field"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Button type="submit" className="btn-primary w-full">
                {t.loginButton}
              </Button>
            </div>
            
            <div className="text-center mt-4">
              <a href="#" className="text-jansunwayi-blue hover:underline text-sm">
                {t.forgotPassword}
              </a>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;