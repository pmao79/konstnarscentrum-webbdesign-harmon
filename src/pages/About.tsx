
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Star, MapPin, Award, Heart } from 'lucide-react';

const About = () => {
  const team = [
    {
      name: "Anna Bergström",
      role: "Grundare & VD",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop",
      bio: "Med över 25 års erfarenhet inom konstvärlden har Anna skapat Svenskt Konstnärscentrum från grunden med visionen att leverera högsta kvalitet till svenska konstnärer."
    },
    {
      name: "Erik Lindberg",
      role: "Butikschef",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop",
      bio: "Erik har arbetat i konstnärsbutiker i över 15 år och har en djup kunskap om material och tekniker inom alla konstformer."
    },
    {
      name: "Sofia Eklund",
      role: "Konstkonsult",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2322&auto=format&fit=crop",
      bio: "Sofia är utbildad konstnär med passion för att hjälpa andra hitta rätt material för sina kreativa projekt."
    },
    {
      name: "Marcus Holmgren",
      role: "Marknadsföring",
      image: "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=2344&auto=format&fit=crop",
      bio: "Med bakgrund inom digital design och marknadsföring hjälper Marcus till att förmedla vår passion för konst online."
    }
  ];

  const values = [
    {
      icon: Star,
      title: "Kvalitet",
      description: "Vi kompromissar aldrig med kvaliteten på våra produkter och väljer noggrant ut varje artikel i vårt sortiment."
    },
    {
      icon: Users,
      title: "Gemenskap",
      description: "Vi strävar efter att skapa en välkomnande plats för alla konstnärer, oavsett nivå eller erfarenhet."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Vår kärlek till konst driver allt vi gör och inspirerar oss att ständigt utvecklas och bli bättre."
    },
    {
      icon: Award,
      title: "Expertis",
      description: "Vår personal består av utbildade konstnärer och experter som kan ge kvalificerad rådgivning."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-art-sky py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium mb-6">Vår Historia & Vision</h1>
            <p className="text-lg md:text-xl mb-4">Svenskt Konstnärscentrum – där kreativitet möter kvalitet sedan 1982</p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-medium mb-6 brush-underline inline-block">Vår Berättelse</h2>
              <p className="text-lg mb-4">
                Svenskt Konstnärscentrum grundades 1982 av Anna Bergström, en passionerad konstnär med en vision om att skapa en plats där konstnärer kunde hitta material av högsta kvalitet och samtidigt få expertråd och inspiration.
              </p>
              <p className="text-lg mb-4">
                Vad som började som en liten butik i centrala Stockholm har idag vuxit till en betydande aktör i den svenska konstvärlden, med både fysiska butiker och en omfattande webbutik.
              </p>
              <p className="text-lg mb-4">
                Genom åren har vi byggt upp ett rykte för vår expertis, vårt breda sortiment och vår passion för att hjälpa kreativa människor att nå sin fulla potential. Vår filosofi har alltid varit att kvalitet lönar sig i längden, och vi står stolt bakom varje produkt vi säljer.
              </p>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=2574&auto=format&fit=crop" 
                alt="Svenskt Konstnärscentrum genom åren" 
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
                <p className="text-xl font-serif">40+ år</p>
                <p className="text-sm text-muted-foreground">av konstnärlig expertis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-art-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-serif font-medium mb-4">Våra Värderingar</h2>
            <p className="text-lg text-muted-foreground">Principer som guidar allt vi gör i vårt dagliga arbete.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-art-sand h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-art-sky flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-medium mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-serif font-medium mb-4">Vårt Team</h2>
            <p className="text-lg text-muted-foreground">Möt människorna som gör Svenskt Konstnärscentrum till en speciell plats.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((person, index) => (
              <div key={index} className="animate-fade-up" style={{ animationDelay: `${index * 0.1 + 0.3}s` }}>
                <Card className="border-art-sand h-full">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={person.image} 
                      alt={person.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium">{person.name}</h3>
                    <p className="text-primary text-sm mb-2">{person.role}</p>
                    <p className="text-muted-foreground">{person.bio}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Location */}
      <section className="py-16 bg-art-sand">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-medium mb-6 brush-underline inline-block">Besök Vår Butik</h2>
              <p className="text-lg mb-6">
                Vi välkomnar dig till vår butik i centrala Stockholm. Här kan du utforska vårt breda sortiment, få personlig rådgivning och delta i våra regelbundna workshops och evenemang.
              </p>
              
              <div className="flex items-start mb-4">
                <MapPin className="h-5 w-5 text-primary mt-1 mr-3" />
                <div>
                  <h4 className="font-medium">Adress</h4>
                  <p className="text-muted-foreground">
                    Konstnärsvägen 12<br />
                    114 36 Stockholm
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="border border-art-clay rounded-md p-4">
                  <h4 className="font-medium mb-2">Öppettider</h4>
                  <ul className="text-muted-foreground">
                    <li className="flex justify-between">
                      <span>Måndag-Fredag</span>
                      <span>10:00 - 18:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Lördag</span>
                      <span>11:00 - 16:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Söndag</span>
                      <span>Stängt</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border border-art-clay rounded-md p-4">
                  <h4 className="font-medium mb-2">Kontakt</h4>
                  <ul className="text-muted-foreground">
                    <li className="flex justify-between">
                      <span>Telefon</span>
                      <span>08-123 45 67</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Email</span>
                      <span className="text-primary">info@konstnarscentrum.se</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="w-full h-[400px] bg-art-cream rounded-lg shadow-md"></div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
