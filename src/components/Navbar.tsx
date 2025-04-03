
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SKCLogo from './SKCLogo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white border-b border-art-sand sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <SKCLogo />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Hem</Link>
            <Link to="/produkter" className="text-foreground hover:text-primary transition-colors">Produkter</Link>
            <Link to="/om-oss" className="text-foreground hover:text-primary transition-colors">Om oss</Link>
            <Link to="/kontakt" className="text-foreground hover:text-primary transition-colors">Kontakt</Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute top-0 right-0 bg-accent text-accent-foreground rounded-full h-4 w-4 text-xs flex items-center justify-center">0</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden animated-mobile-menu">
            <div className="flex flex-col space-y-4 py-4">
              <Link to="/" className="px-4 py-2 text-foreground hover:bg-muted rounded" onClick={toggleMenu}>Hem</Link>
              <Link to="/produkter" className="px-4 py-2 text-foreground hover:bg-muted rounded" onClick={toggleMenu}>Produkter</Link>
              <Link to="/om-oss" className="px-4 py-2 text-foreground hover:bg-muted rounded" onClick={toggleMenu}>Om oss</Link>
              <Link to="/kontakt" className="px-4 py-2 text-foreground hover:bg-muted rounded" onClick={toggleMenu}>Kontakt</Link>
              
              <div className="flex items-center space-x-2 px-4 pt-4 border-t border-art-sand">
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
