import { z } from 'zod';

export const openingHoursSchema = z.object({
  monday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    closed: z.boolean().default(false),
  }),
  tuesday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    closed: z.boolean().default(false),
  }),
  wednesday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    closed: z.boolean().default(false),
  }),
  thursday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    closed: z.boolean().default(false),
  }),
  friday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    closed: z.boolean().default(false),
  }),
  saturday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    closed: z.boolean().default(false),
  }),
  sunday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltig tid'),
    closed: z.boolean().default(false),
  }),
});

export const deliveryOptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Namn krävs'),
  description: z.string().optional(),
  price: z.number().min(0, 'Pris måste vara positivt'),
  active: z.boolean().default(true),
});

export const paymentMethodSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Namn krävs'),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export const settingsSchema = z.object({
  id: z.string().optional(),
  store_name: z.string().min(1, 'Butiksnamn krävs'),
  store_email: z.string().email('Ogiltig e-postadress'),
  store_phone: z.string().optional(),
  store_address: z.string().optional(),
  store_postcode: z.string().optional(),
  store_city: z.string().optional(),
  store_country: z.string().optional(),
  logo_url: z.string().url('Ogiltig URL').optional().or(z.literal('')),
  favicon_url: z.string().url('Ogiltig URL').optional().or(z.literal('')),
  opening_hours: openingHoursSchema,
  delivery_options: z.array(deliveryOptionSchema),
  payment_methods: z.array(paymentMethodSchema),
  terms_and_conditions: z.string().optional(),
});

export type OpeningHours = z.infer<typeof openingHoursSchema>;
export type DeliveryOption = z.infer<typeof deliveryOptionSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type StoreSettings = z.infer<typeof settingsSchema>;

export type UpdateStoreSettings = Partial<StoreSettings>; 