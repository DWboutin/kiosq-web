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
      categories: {
        Row: {
          created_at: string
          id: string
          name_translations: Json
          order_position: number
          parent_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name_translations?: Json
          order_position?: number
          parent_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name_translations?: Json
          order_position?: number
          parent_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          low_stock_threshold: number
          quantity_per_unit: number
          stock: number
          unit: string
          updated_at: string
          updated_by: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          low_stock_threshold?: number
          quantity_per_unit?: number
          stock?: number
          unit?: string
          updated_at?: string
          updated_by?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          low_stock_threshold?: number
          quantity_per_unit?: number
          stock?: number
          unit?: string
          updated_at?: string
          updated_by?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices: {
        Row: {
          base_amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          discount_amount: number
          effective_end: string | null
          effective_start: string
          final_amount: number | null
          id: string
          product_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          base_amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          discount_amount?: number
          effective_end?: string | null
          effective_start: string
          final_amount?: number | null
          id?: string
          product_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          base_amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          discount_amount?: number
          effective_end?: string | null
          effective_start?: string
          final_amount?: number | null
          id?: string
          product_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices_2025: {
        Row: {
          base_amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          discount_amount: number
          effective_end: string | null
          effective_start: string
          final_amount: number | null
          id: string
          product_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          base_amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          discount_amount?: number
          effective_end?: string | null
          effective_start: string
          final_amount?: number | null
          id?: string
          product_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          base_amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          discount_amount?: number
          effective_end?: string | null
          effective_start?: string
          final_amount?: number | null
          id?: string
          product_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          option_values: Json
          price_adjustment: number
          product_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_values: Json
          price_adjustment?: number
          product_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          option_values?: Json
          price_adjustment?: number
          product_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_unit: string
          category_id: string
          created_at: string
          description_translations: Json
          id: string
          is_taxable: boolean
          name_translations: Json
          search_vector: unknown | null
          status: string
          tax_country: string | null
          tax_region: string | null
          updated_at: string
          updated_by: string | null
          vendor_id: string | null
        }
        Insert: {
          base_unit?: string
          category_id: string
          created_at?: string
          description_translations?: Json
          id?: string
          is_taxable?: boolean
          name_translations?: Json
          search_vector?: unknown | null
          status?: string
          tax_country?: string | null
          tax_region?: string | null
          updated_at?: string
          updated_by?: string | null
          vendor_id?: string | null
        }
        Update: {
          base_unit?: string
          category_id?: string
          created_at?: string
          description_translations?: Json
          id?: string
          is_taxable?: boolean
          name_translations?: Json
          search_vector?: unknown | null
          status?: string
          tax_country?: string | null
          tax_region?: string | null
          updated_at?: string
          updated_by?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      tax_components: {
        Row: {
          country_code: string
          created_at: string
          currency_code: string
          effective_end: string | null
          effective_start: string
          id: string
          is_included_in_price: boolean
          rate: number
          region_code: string | null
          tax_type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          country_code: string
          created_at?: string
          currency_code: string
          effective_end?: string | null
          effective_start: string
          id?: string
          is_included_in_price?: boolean
          rate: number
          region_code?: string | null
          tax_type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string
          currency_code?: string
          effective_end?: string | null
          effective_start?: string
          id?: string
          is_included_in_price?: boolean
          rate?: number
          region_code?: string | null
          tax_type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_components_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          accepted_terms_at: string | null
          avatar_url: string
          created_at: string | null
          email: string
          email_opt_in: boolean | null
          id: string
          name: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_terms_at?: string | null
          avatar_url: string
          created_at?: string | null
          email: string
          email_opt_in?: boolean | null
          id: string
          name?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_terms_at?: string | null
          avatar_url?: string
          created_at?: string | null
          email?: string
          email_opt_in?: boolean | null
          id?: string
          name?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vendor_profiles: {
        Row: {
          banner_image: string | null
          created_at: string
          id: string
          name_translations: Json
          slug: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          banner_image?: string | null
          created_at?: string
          id?: string
          name_translations?: Json
          slug: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          banner_image?: string | null
          created_at?: string
          id?: string
          name_translations?: Json
          slug?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_search_cache: {
        Row: {
          id: string | null
          lowest_price: number | null
          name_translations: Json | null
          search_vector: unknown | null
          variant_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      currency_code: "CAD" | "USD"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      currency_code: ["CAD", "USD"],
    },
  },
} as const
