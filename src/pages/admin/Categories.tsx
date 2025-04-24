
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProductCategorization from '@/components/admin/ProductCategorization';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash,
  Loader2,
  Save,
  X,
  Package,
  Tag
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<{name: string, description: string}>({
    name: '',
    description: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Fel",
        description: "Det gick inte att hämta kategorier",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product counts per category
  const fetchCategoryCounts = async () => {
    try {
      // Get counts for each category
      const { data, error } = await supabase
        .from('products')
        .select('category, count')
        .not('category', 'is', null)
        .group('category');
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(item => {
        if (item.category) {
          counts[item.category] = parseInt(item.count);
        }
      });
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCategoryCounts();
  }, []);

  const handleSaveCategory = async () => {
    try {
      setIsSaving(true);
      
      // Update existing category
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: editingCategory.name,
            description: editingCategory.description
          })
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        
        toast({
          title: "Kategori uppdaterad",
          description: `Kategorin "${editingCategory.name}" har uppdaterats`
        });
        
        setEditingCategory(null);
      } 
      // Create new category
      else if (isAdding) {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: newCategory.name,
            description: newCategory.description || null
          });
        
        if (error) throw error;
        
        toast({
          title: "Kategori skapad",
          description: `Kategorin "${newCategory.name}" har skapats`
        });
        
        setIsAdding(false);
        setNewCategory({ name: '', description: '' });
      }
      
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Fel",
        description: "Det gick inte att spara kategorin",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`Är du säker på att du vill ta bort kategorin "${category.name}"?`)) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', category.id);
        
        if (error) throw error;
        
        toast({
          title: "Kategori borttagen",
          description: `Kategorin "${category.name}" har tagits bort`
        });
        
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Fel",
          description: "Det gick inte att ta bort kategorin",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/10">
        <AdminSidebar />
        
        <SidebarInset>
          <div className="container px-4 py-8 md:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-serif mb-1">Kategorier</h1>
                <p className="text-muted-foreground">Hantera dina produktkategorier</p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="list">
                  <Tag className="h-4 w-4 mr-2" />
                  Kategorilista
                </TabsTrigger>
                <TabsTrigger value="auto">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Autokategorisering
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-6">
                {!isAdding && !editingCategory && (
                  <Button onClick={() => setIsAdding(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Lägg till kategori
                  </Button>
                )}
                
                {isAdding && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Lägg till ny kategori</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="name">
                            Namn <span className="text-destructive">*</span>
                          </label>
                          <Input
                            id="name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                            placeholder="Kategorinamn"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="description">
                            Beskrivning
                          </label>
                          <Textarea
                            id="description"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                            placeholder="Kategoribeskrivning"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsAdding(false)}>
                            <X className="mr-2 h-4 w-4" /> Avbryt
                          </Button>
                          <Button 
                            onClick={handleSaveCategory} 
                            disabled={isSaving || !newCategory.name.trim()}
                          >
                            {isSaving ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Spara
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Kategorilista {categories.length > 0 && 
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({categories.length} kategorier)
                        </span>
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : categories.length > 0 ? (
                      <div className="space-y-4">
                        {categories.map((category) => (
                          <div 
                            key={category.id} 
                            className="border rounded-md overflow-hidden"
                          >
                            {editingCategory && editingCategory.id === category.id ? (
                              <div className="p-4 space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1" htmlFor={`edit-name-${category.id}`}>
                                    Namn <span className="text-destructive">*</span>
                                  </label>
                                  <Input
                                    id={`edit-name-${category.id}`}
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                    placeholder="Kategorinamn"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1" htmlFor={`edit-description-${category.id}`}>
                                    Beskrivning
                                  </label>
                                  <Textarea
                                    id={`edit-description-${category.id}`}
                                    value={editingCategory.description || ''}
                                    onChange={(e) => setEditingCategory({
                                      ...editingCategory, 
                                      description: e.target.value || null
                                    })}
                                    placeholder="Kategoribeskrivning"
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setEditingCategory(null)}>
                                    <X className="mr-2 h-4 w-4" /> Avbryt
                                  </Button>
                                  <Button 
                                    onClick={handleSaveCategory} 
                                    disabled={isSaving || !editingCategory.name.trim()}
                                  >
                                    {isSaving ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Spara
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary/10 p-2 rounded-md">
                                    <Package size={20} className="text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium">{category.name}</h3>
                                      {categoryCounts[category.name] > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                          {categoryCounts[category.name]} produkter
                                        </Badge>
                                      )}
                                    </div>
                                    {category.description && (
                                      <p className="text-sm text-muted-foreground">{category.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => setEditingCategory(category)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={() => handleDeleteCategory(category)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-1">Inga kategorier hittades</p>
                        <p className="text-muted-foreground mb-4">
                          Skapa din första kategori för att organisera dina produkter
                        </p>
                        {!isAdding && (
                          <Button onClick={() => setIsAdding(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Lägg till kategori
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="auto">
                <ProductCategorization />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminCategories;
