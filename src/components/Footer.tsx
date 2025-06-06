
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import SKCLogo from './SKCLogo';

const Footer = () => {
  return (
    <footer className="bg-art-cream text-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <SKCLogo />
            </Link>
            <p className="text-muted-foreground mb-4">
              Din butik för kvalitetsmaterial till konstnärens kreativa värld.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4">Snabblänkar</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Hem</Link></li>
              <li><Link to="/produkter" className="text-muted-foreground hover:text-primary transition-colors">Produkter</Link></li>
              <li><Link to="/om-oss" className="text-muted-foreground hover:text-primary transition-colors">Om oss</Link></li>
              <li><Link to="/kontakt" className="text-muted-foreground hover:text-primary transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4">Kategorier</h3>
            <ul className="space-y-2">
              <li><Link to="/produkter/farg" className="text-muted-foreground hover:text-primary transition-colors">Färg</Link></li>
              <li><Link to="/produkter/penslar" className="text-muted-foreground hover:text-primary transition-colors">Penslar</Link></li>
              <li><Link to="/produkter/papper" className="text-muted-foreground hover:text-primary transition-colors">Papper & Canvas</Link></li>
              <li><Link to="/produkter/stafflier" className="text-muted-foreground hover:text-primary transition-colors">Stafflier</Link></li>
              <li><Link to="/produkter/bocker" className="text-muted-foreground hover:text-primary transition-colors">Böcker</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4">Kontakt</h3>
            <address className="not-italic space-y-2 text-muted-foreground">
              <p>Götagatan 11</p>
              <p>291 53 Kristianstad</p>
              <p>Telefon: 044-10 22 44</p>
              <p>Email: info@skabuk.se</p>
            </address>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Öppettider</h4>
              <ul className="text-muted-foreground">
                <li className="flex justify-between">
                  <span>Mån-Fre</span>
                  <span>10:00 - 17:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Lördag</span>
                  <span>Stängt</span>
                </li>
                <li className="flex justify-between">
                  <span>Söndag</span>
                  <span>Stängt</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-art-sand mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Svenskt Konstnärscentrum. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
