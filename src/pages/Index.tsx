
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, Brush, BookOpen, Easel, ScrollText, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 1,
    name: "Färg",
    description: "Akvarell, akryl, olja & mer",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop",
    icon: Palette,
    path: "/produkter/farg"
  },
  {
    id: 2,
    name: "Penslar",
    description: "För alla tekniker & stilar",
    image: "https://images.unsplash.com/photo-1590086783191-a0694c7d1e6e?q=80&w=2070&auto=format&fit=crop",
    icon: Brush,
    path: "/produkter/penslar"
  },
  {
    id: 3,
    name: "Papper",
    description: "Canvas, block & specialpapper",
    image: "https://images.unsplash.com/photo-1517697471339-4aa32003c11a?q=80&w=2076&auto=format&fit=crop",
    icon: ScrollText,
    path: "/produkter/papper"
  },
  {
    id: 4,
    name: "Stafflier",
    description: "Studio & plein-air",
    image: "https://images.unsplash.com/photo-1579762593175-20226054cad0?q=80&w=2071&auto=format&fit=crop",
    icon: Easel,
    path: "/produkter/stafflier"
  }
];

const featuredProducts = [
  {
    id: 1,
    name: "Winsor & Newton Akvarellfärg",
    category: "Färg",
    price: 229,
    image: "https://images.unsplash.com/photo-1520420097861-e4959843b682?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Kolinsky Akvarellpensel",
    category: "Penslar",
    price: 298,
    image: "https://images.unsplash.com/photo-1590086782792-42dd2350140d?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Arches Akvarellpapper",
    category: "Papper",
    price: 159,
    image: "https://images.unsplash.com/photo-1455885661740-29cbf08a42fa?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Naysan Bordsställ",
    category: "Stafflier",
    price: 495,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop"
  }
];

const articles = [
  {
    id: 1,
    title: "Grunderna i akvarellmålning",
    excerpt: "Lär dig de grundläggande teknikerna för att måla med akvarell...",
    image: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Färgteori för konstnärer",
    excerpt: "Förstå hur färger fungerar tillsammans för att förbättra din konst...",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2080&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Välja rätt penslar för olika tekniker",
    excerpt: "En guide till olika penseltyper och när de används bäst...",
    image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=2075&auto=format&fit=crop"
  }
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6">Upptäck konstnärens värld</h1>
            <p className="text-lg md:text-xl mb-8">Kvalitetsmaterial för kreativa själar. Från nybörjare till professionella.</p>
            <div className="flex flex-wrap gap-4">
              <Button className="btn-primary" asChild>
                <Link to="/produkter">Utforska produkter</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/om-oss">Om oss</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-medium mb-3">Våra Kategorier</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground max-w-xl mx-auto">Utforska vårt sortiment av högkvalitativa konstnärsmaterial, noggrant utvalda för att inspirera din kreativitet.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link to={category.path} key={category.id} className="card-hover animate-fade-in delay-100">
                <Card className="overflow-hidden h-full border-art-sand">
                  <div className="relative h-48">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-serif">{category.name}</h3>
                      <p className="text-sm opacity-80">{category.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-art-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-medium mb-3">Nyheter & Populära Produkter</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground max-w-xl mx-auto">Upptäck våra senaste nyheter och bästsäljande produkter.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="card-hover animate-fade-in delay-200">
                <Card className="overflow-hidden h-full border-art-sand">
                  <div className="h-48">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-primary font-medium mb-1">{product.category}</div>
                    <h3 className="text-lg font-medium mb-2">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{product.price} kr</span>
                      <Button variant="ghost" size="sm">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Lägg i varukorg
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link to="/produkter">Visa alla produkter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Blog & Inspiration */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-medium mb-3">Inspiration & Teknik</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground max-w-xl mx-auto">Lär dig nya tekniker, få inspiration och fördjupa dina kunskaper inom konst.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <div key={article.id} className="card-hover animate-fade-in delay-300">
                <Card className="overflow-hidden h-full border-art-sand">
                  <div className="h-48">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-serif mb-2">{article.title}</h3>
                    <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                    <Link to="#" className="text-primary hover:underline inline-flex items-center">
                      Läs mer
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-art-sand">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in delay-300">
              <img 
                src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?q=80&w=2047&auto=format&fit=crop" 
                alt="Om Konstnärscentrum" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="animate-fade-in delay-400">
              <h2 className="text-3xl font-serif font-medium mb-6 brush-underline inline-block">Vår Historia & Passion</h2>
              <p className="text-lg mb-4">
                Svenskt Konstnärscentrum grundades 1982 med målet att förse svenska konstnärer med material av högsta kvalitet. Vårt team består av passionerade konstälskare med gedigen erfarenhet.
              </p>
              <p className="text-lg mb-6">
                Idag är vi stolta över att vara en knutpunkt för konstnärer i alla skeden av sin karriär. Vi erbjuder inte bara material utan också kunskap, inspiration och gemenskap.
              </p>
              <Button variant="outline" asChild className="inline-flex items-center">
                <Link to="/om-oss">
                  Läs mer om oss
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
