import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Image, Globe, Upload, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getStoreSettings, updateStoreSettings } from '@/api/settings';
import { StoreSettings, settingsSchema } from '@/types/settings';
import { uploadFile, UploadType } from '@/api/upload';

const weekDays = [
  { id: 'monday', label: 'Måndag' },
  { id: 'tuesday', label: 'Tisdag' },
  { id: 'wednesday', label: 'Onsdag' },
  { id: 'thursday', label: 'Torsdag' },
  { id: 'friday', label: 'Fredag' },
  { id: 'saturday', label: 'Lördag' },
  { id: 'sunday', label: 'Söndag' },
] as const;

type WeekDay = typeof weekDays[number]['id'];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadType | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const form = useForm<StoreSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      id: '',
      store_name: '',
      store_email: '',
      store_phone: '',
      store_address: '',
      store_postcode: '',
      store_city: '',
      store_country: '',
      logo_url: '',
      favicon_url: '',
      opening_hours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '15:00', closed: false },
        sunday: { open: '10:00', close: '15:00', closed: true },
      },
      delivery_options: [],
      payment_methods: [],
      terms_and_conditions: '',
    },
  });

  const {
    fields: deliveryFields,
    append: appendDelivery,
    remove: removeDelivery,
  } = useFieldArray({
    control: form.control,
    name: 'delivery_options',
  });

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control: form.control,
    name: 'payment_methods',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getStoreSettings();
        setSettings(data);
        form.reset(data);
      } catch (error) {
        toast.error('Kunde inte ladda inställningar');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [form]);

  const onSubmit = async (data: StoreSettings) => {
    if (!settings?.id) return;

    setSaving(true);
    try {
      await updateStoreSettings({
        id: settings.id,
        ...data,
      });
      toast.success('Inställningar sparade');
    } catch (error) {
      toast.error('Kunde inte spara inställningar');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: UploadType) => {
    setUploading(type);
    try {
      const url = await uploadFile(file, type);
      form.setValue(type === 'logo' ? 'logo_url' : 'favicon_url', url);
      toast.success(`${type === 'logo' ? 'Logotyp' : 'Favicon'} uppladdad`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Något gick fel vid uppladdning');
    } finally {
      setUploading(null);
    }
  };

  const handleAddDeliveryOption = () => {
    appendDelivery({
      id: uuidv4(),
      name: '',
      description: '',
      price: 0,
      active: true,
    });
  };

  const handleAddPaymentMethod = () => {
    appendPayment({
      id: uuidv4(),
      name: '',
      description: '',
      active: true,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Butiksinställningar</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Grundläggande information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store_name">Butiksnamn</Label>
                <Input
                  id="store_name"
                  {...form.register('store_name')}
                />
                {form.formState.errors.store_name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.store_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_email">E-post</Label>
                <Input
                  id="store_email"
                  type="email"
                  {...form.register('store_email')}
                />
                {form.formState.errors.store_email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.store_email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_phone">Telefon</Label>
                <Input
                  id="store_phone"
                  {...form.register('store_phone')}
                />
                {form.formState.errors.store_phone && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.store_phone.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store_address">Gatuadress</Label>
                <Input
                  id="store_address"
                  {...form.register('store_address')}
                />
                {form.formState.errors.store_address && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.store_address.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_postcode">Postnummer</Label>
                <Input
                  id="store_postcode"
                  {...form.register('store_postcode')}
                />
                {form.formState.errors.store_postcode && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.store_postcode.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_city">Stad</Label>
                <Input
                  id="store_city"
                  {...form.register('store_city')}
                />
                {form.formState.errors.store_city && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.store_city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_country">Land</Label>
                <Input
                  id="store_country"
                  {...form.register('store_country')}
                />
                {form.formState.errors.store_country && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.store_country.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logotyp</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo_url"
                    {...form.register('logo_url')}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    id="logo_upload"
                    accept=".png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logo');
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo_upload')?.click()}
                    disabled={uploading === 'logo'}
                  >
                    {uploading === 'logo' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.logo_url && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.logo_url.message}
                  </p>
                )}
                {form.watch('logo_url') && (
                  <div className="mt-2">
                    <img
                      src={form.watch('logo_url')}
                      alt="Logotyp"
                      className="max-h-20"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon_url">Favicon</Label>
                <div className="flex gap-2">
                  <Input
                    id="favicon_url"
                    {...form.register('favicon_url')}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    id="favicon_upload"
                    accept=".ico,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'favicon');
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('favicon_upload')?.click()}
                    disabled={uploading === 'favicon'}
                  >
                    {uploading === 'favicon' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.favicon_url && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.favicon_url.message}
                  </p>
                )}
                {form.watch('favicon_url') && (
                  <div className="mt-2">
                    <img
                      src={form.watch('favicon_url')}
                      alt="Favicon"
                      className="h-8 w-8"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Öppettider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weekDays.map((day) => (
              <div key={day.id} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${day.id}-closed`}
                    checked={form.watch(`opening_hours.${day.id}.closed` as const)}
                    onCheckedChange={(checked) => {
                      form.setValue(`opening_hours.${day.id}.closed` as const, checked as boolean);
                    }}
                  />
                  <Label htmlFor={`${day.id}-closed`}>{day.label}</Label>
                </div>
                {!form.watch(`opening_hours.${day.id}.closed` as const) && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`${day.id}-open`}>Öppnar</Label>
                      <Input
                        id={`${day.id}-open`}
                        type="time"
                        {...form.register(`opening_hours.${day.id}.open` as const)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${day.id}-close`}>Stänger</Label>
                      <Input
                        id={`${day.id}-close`}
                        type="time"
                        {...form.register(`opening_hours.${day.id}.close` as const)}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leveransalternativ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deliveryFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Namn</Label>
                  <Input
                    {...form.register(`delivery_options.${index}.name`)}
                    placeholder="Ex: Hemleverans"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beskrivning</Label>
                  <Input
                    {...form.register(`delivery_options.${index}.description`)}
                    placeholder="Ex: Leverans inom 2-3 dagar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pris (kr)</Label>
                  <Input
                    type="number"
                    {...form.register(`delivery_options.${index}.price`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeDelivery(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddDeliveryOption}
            >
              <Plus className="h-4 w-4 mr-2" />
              Lägg till leveransalternativ
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Betalningsalternativ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Namn</Label>
                  <Input
                    {...form.register(`payment_methods.${index}.name`)}
                    placeholder="Ex: Kort"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beskrivning</Label>
                  <Input
                    {...form.register(`payment_methods.${index}.description`)}
                    placeholder="Ex: Betala med kort"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`payment-${index}-active`}
                    checked={form.watch(`payment_methods.${index}.active`)}
                    onCheckedChange={(checked) => {
                      form.setValue(
                        `payment_methods.${index}.active`,
                        checked as boolean
                      );
                    }}
                  />
                  <Label htmlFor={`payment-${index}-active`}>Aktiv</Label>
                </div>
                <div className="flex items-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removePayment(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPaymentMethod}
            >
              <Plus className="h-4 w-4 mr-2" />
              Lägg till betalningsalternativ
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sparar...
              </>
            ) : (
              'Spara inställningar'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 