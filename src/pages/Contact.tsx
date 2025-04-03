
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const Contact = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-art-sky py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium mb-6">Kontakta Oss</h1>
            <p className="text-lg md:text-xl">Vi finns här för att hjälpa dig med alla dina kreativa behov.</p>
          </div>
        </div>
      </section>

      {/* Contact Info and Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-serif font-medium mb-6">Kontaktinformation</h2>
              
              <div className="space-y-6">
                <Card className="border-art-sand">
                  <CardContent className="p-6 flex items-start">
                    <div className="bg-art-sky p-3 rounded-full mr-4">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Besöksadress</h3>
                      <p className="text-muted-foreground">
                        Konstnärsvägen 12<br />
                        114 36 Stockholm
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-art-sand">
                  <CardContent className="p-6 flex items-start">
                    <div className="bg-art-sky p-3 rounded-full mr-4">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Telefon</h3>
                      <p className="text-muted-foreground">08-123 45 67</p>
                      <p className="text-sm text-muted-foreground">(Kundtjänst)</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-art-sand">
                  <CardContent className="p-6 flex items-start">
                    <div className="bg-art-sky p-3 rounded-full mr-4">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">E-post</h3>
                      <p className="text-primary">info@konstnarscentrum.se</p>
                      <p className="text-sm text-muted-foreground">(Allmänna frågor)</p>
                      <p className="text-primary mt-2">order@konstnarscentrum.se</p>
                      <p className="text-sm text-muted-foreground">(Orderrelaterade frågor)</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-art-sand">
                  <CardContent className="p-6 flex items-start">
                    <div className="bg-art-sky p-3 rounded-full mr-4">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Öppettider</h3>
                      <ul className="text-muted-foreground">
                        <li className="flex justify-between mb-1">
                          <span>Måndag-Fredag</span>
                          <span>10:00 - 18:00</span>
                        </li>
                        <li className="flex justify-between mb-1">
                          <span>Lördag</span>
                          <span>11:00 - 16:00</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Söndag</span>
                          <span>Stängt</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-art-sand">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <MessageCircle className="h-6 w-6 mr-2 text-primary" />
                    <h2 className="text-2xl font-serif font-medium">Kontaktformulär</h2>
                  </div>
                  
                  <form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="name" className="block mb-1 text-sm">Namn *</label>
                        <input 
                          type="text" 
                          id="name" 
                          className="w-full p-2 border border-art-sand rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block mb-1 text-sm">E-postadress *</label>
                        <input 
                          type="email" 
                          id="email" 
                          className="w-full p-2 border border-art-sand rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="subject" className="block mb-1 text-sm">Ämne *</label>
                      <input 
                        type="text" 
                        id="subject" 
                        className="w-full p-2 border border-art-sand rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="message" className="block mb-1 text-sm">Meddelande *</label>
                      <textarea 
                        id="message" 
                        rows={5}
                        className="w-full p-2 border border-art-sand rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">* Obligatoriska fält</p>
                      <Button type="submit" className="btn-primary">
                        Skicka meddelande
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              {/* FAQ */}
              <div className="mt-8">
                <h3 className="text-xl font-serif font-medium mb-4">Vanliga Frågor</h3>
                <div className="space-y-4">
                  <details className="rounded-lg border border-art-sand p-4">
                    <summary className="font-medium cursor-pointer">Hur lång tid tar leveransen?</summary>
                    <p className="mt-2 text-muted-foreground">Leveranstiden inom Sverige är vanligtvis 2-4 arbetsdagar. För express-leverans, vänligen kontakta oss direkt.</p>
                  </details>
                  
                  <details className="rounded-lg border border-art-sand p-4">
                    <summary className="font-medium cursor-pointer">Har ni öppet köp?</summary>
                    <p className="mt-2 text-muted-foreground">Ja, vi erbjuder 30 dagars öppet köp på alla oanvända produkter i originalförpackning. Kontakta oss för att arrangera en retur.</p>
                  </details>
                  
                  <details className="rounded-lg border border-art-sand p-4">
                    <summary className="font-medium cursor-pointer">Erbjuder ni personlig rådgivning?</summary>
                    <p className="mt-2 text-muted-foreground">Absolut! Vi erbjuder personlig rådgivning både i butiken och via telefon. Tveka inte att kontakta oss för att boka en tid.</p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="h-[400px] bg-art-cream rounded-lg shadow-md flex items-center justify-center">
            <div className="text-center">
              <p className="font-medium mb-2">Google Maps-integration</p>
              <p className="text-muted-foreground">Karta skulle visas här</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
