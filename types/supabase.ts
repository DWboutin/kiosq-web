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
          description_translations: Json | null
          id: string
          image_url: string | null
          is_active: boolean
          is_deleted: boolean
          name_translations: Json
          order_rank: number | null
          parent_id: string | null
          slug: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description_translations?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_deleted?: boolean
          name_translations?: Json
          order_rank?: number | null
          parent_id?: string | null
          slug?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description_translations?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_deleted?: boolean
          name_translations?: Json
          order_rank?: number | null
          parent_id?: string | null
          slug?: Json
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          low_stock_threshold: number | null
          quantity: number
          unit: string | null
          updated_at: string
          updated_by: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          quantity?: number
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          quantity?: number
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
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
          base_price: number
          created_at: string
          currency: string | null
          discount_amount: number | null
          discount_type: string | null
          effective_from: string
          effective_to: string | null
          final_price: number | null
          id: string
          is_tax_inclusive: boolean | null
          updated_at: string
          updated_by: string | null
          variant_id: string
        }
        Insert: {
          base_price: number
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          effective_from?: string
          effective_to?: string | null
          final_price?: number | null
          id?: string
          is_tax_inclusive?: boolean | null
          updated_at?: string
          updated_by?: string | null
          variant_id: string
        }
        Update: {
          base_price?: number
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          effective_from?: string
          effective_to?: string | null
          final_price?: number | null
          id?: string
          is_tax_inclusive?: boolean | null
          updated_at?: string
          updated_by?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices_2025: {
        Row: {
          base_price: number
          created_at: string
          currency: string | null
          discount_amount: number | null
          discount_type: string | null
          effective_from: string
          effective_to: string | null
          final_price: number | null
          id: string
          is_tax_inclusive: boolean | null
          updated_at: string
          updated_by: string | null
          variant_id: string
        }
        Insert: {
          base_price: number
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          effective_from?: string
          effective_to?: string | null
          final_price?: number | null
          id?: string
          is_tax_inclusive?: boolean | null
          updated_at?: string
          updated_by?: string | null
          variant_id: string
        }
        Update: {
          base_price?: number
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          effective_from?: string
          effective_to?: string | null
          final_price?: number | null
          id?: string
          is_tax_inclusive?: boolean | null
          updated_at?: string
          updated_by?: string | null
          variant_id?: string
        }
        Relationships: []
      }
      product_taxes: {
        Row: {
          created_at: string
          id: string
          product_id: string
          tax_component_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          tax_component_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          tax_component_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_taxes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_taxes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_taxes_tax_component_id_fkey"
            columns: ["tax_component_id"]
            isOneToOne: false
            referencedRelation: "tax_components"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_default: boolean | null
          is_deleted: boolean
          option_values: Json
          product_id: string
          sku: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_default?: boolean | null
          is_deleted?: boolean
          option_values?: Json
          product_id: string
          sku?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_default?: boolean | null
          is_deleted?: boolean
          option_values?: Json
          product_id?: string
          sku?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_images: Json | null
          category_id: string | null
          created_at: string
          description_translations: Json | null
          features_translations: Json | null
          id: string
          is_deleted: boolean
          is_featured: boolean | null
          main_image_url: string | null
          metadata: Json | null
          name_translations: Json
          slug: string
          status: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          additional_images?: Json | null
          category_id?: string | null
          created_at?: string
          description_translations?: Json | null
          features_translations?: Json | null
          id?: string
          is_deleted?: boolean
          is_featured?: boolean | null
          main_image_url?: string | null
          metadata?: Json | null
          name_translations?: Json
          slug: string
          status?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          additional_images?: Json | null
          category_id?: string | null
          created_at?: string
          description_translations?: Json | null
          features_translations?: Json | null
          id?: string
          is_deleted?: boolean
          is_featured?: boolean | null
          main_image_url?: string | null
          metadata?: Json | null
          name_translations?: Json
          slug?: string
          status?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          banner_image: string | null
          created_at: string
          id: string
          is_deleted: boolean
          name_translations: Json | null
          slug_translations: Json | null
          type: Database["public"]["Enums"]["profile_type"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          banner_image?: string | null
          created_at?: string
          id?: string
          is_deleted?: boolean
          name_translations?: Json | null
          slug_translations?: Json | null
          type?: Database["public"]["Enums"]["profile_type"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          banner_image?: string | null
          created_at?: string
          id?: string
          is_deleted?: boolean
          name_translations?: Json | null
          slug_translations?: Json | null
          type?: Database["public"]["Enums"]["profile_type"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_components: {
        Row: {
          code: string
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean
          name: string
          rate: number
          region: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name: string
          rate: number
          region: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name?: string
          rate?: number
          region?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_components_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_deleted: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          is_deleted?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_deleted?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      product_search: {
        Row: {
          category_name: Json | null
          category_slug: Json | null
          description_translations: Json | null
          id: string | null
          is_featured: boolean | null
          main_image_url: string | null
          max_price: number | null
          min_price: number | null
          name_translations: Json | null
          profile_type: Database["public"]["Enums"]["profile_type"] | null
          slug: string | null
          status: string | null
          total_inventory: number | null
          vendor_name: string | null
          vendor_slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_category: {
        Args: { category_id: string }
        Returns: undefined
      }
      has_role_permission: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      profile_type: "personal" | "vendor"
      user_role: "admin" | "vendor-admin" | "vendor-manager" | "user"
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
      profile_type: ["personal", "vendor"],
      user_role: ["admin", "vendor-admin", "vendor-manager", "user"],
    },
  },
} as const
