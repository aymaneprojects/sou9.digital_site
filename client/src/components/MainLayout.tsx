import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-16"> {/* Revenir à l'ancienne valeur de padding */}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;