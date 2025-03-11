
import React from 'react';
import Header from './Header';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf4]">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default Layout;
