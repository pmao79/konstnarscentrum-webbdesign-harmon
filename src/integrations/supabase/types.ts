export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          new_data: Json | null
          previous_data: Json | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          customer_id: string
          end_date: string
          id: string
          notes: string | null
          property_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          end_date: string
          id?: string
          notes?: string | null
          property_id: string
          start_date: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          end_date?: string
          id?: string
          notes?: string | null
          property_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          content: string | null
          created_at: string
          id: string
          page: string
          published: boolean | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          page: string
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          page?: string
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      hemsida: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          exported_to_hubspot: boolean
          id: string
          meeting_date: string | null
          meeting_time: string | null
          meeting_type: string | null
          message: string | null
          name: string
          phone: string
          source: string
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          exported_to_hubspot?: boolean
          id?: string
          meeting_date?: string | null
          meeting_time?: string | null
          meeting_type?: string | null
          message?: string | null
          name: string
          phone: string
          source: string
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          exported_to_hubspot?: boolean
          id?: string
          meeting_date?: string | null
          meeting_time?: string | null
          meeting_type?: string | null
          message?: string | null
          name?: string
          phone?: string
          source?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: string | null
          available_shares: number
          bathrooms: number | null
          beach_distance: number | null
          bedrooms: number | null
          built_year: number | null
          cover_image: string | null
          created_at: string
          description: string | null
          has_pool: boolean | null
          id: string
          location: string
          name: string
          plot_size: number | null
          price: number
          property_size: number | null
          status: string
          total_shares: number
          updated_at: string
        }
        Insert: {
          amenities?: string | null
          available_shares: number
          bathrooms?: number | null
          beach_distance?: number | null
          bedrooms?: number | null
          built_year?: number | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          has_pool?: boolean | null
          id?: string
          location: string
          name: string
          plot_size?: number | null
          price: number
          property_size?: number | null
          status: string
          total_shares: number
          updated_at?: string
        }
        Update: {
          amenities?: string | null
          available_shares?: number
          bathrooms?: number | null
          beach_distance?: number | null
          bedrooms?: number | null
          built_year?: number | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          has_pool?: boolean | null
          id?: string
          location?: string
          name?: string
          plot_size?: number | null
          price?: number
          property_size?: number | null
          status?: string
          total_shares?: number
          updated_at?: string
        }
        Relationships: []
      }
      property_images: {
        Row: {
          created_at: string | null
          id: string
          image_name: string
          image_url: string
          is_cover: boolean | null
          property_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_name: string
          image_url: string
          is_cover?: boolean | null
          property_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_name?: string
          image_url?: string
          is_cover?: boolean | null
          property_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_shares: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          property_id: string
          purchase_date: string
          purchase_price: number
          shares_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          property_id: string
          purchase_date?: string
          purchase_price: number
          shares_count: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          property_id?: string
          purchase_date?: string
          purchase_price?: number
          shares_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_shares_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_shares_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          created_at: string
          customer_email: string | null
          customizations: Json
          id: string
          name: string | null
          property_id: string
          seller_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customizations: Json
          id?: string
          name?: string | null
          property_id: string
          seller_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customizations?: Json
          id?: string
          name?: string | null
          property_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_property"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          attachment_url: string | null
          created_at: string
          customer_id: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          customer_id: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
