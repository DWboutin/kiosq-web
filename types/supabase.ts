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
      kiosqs: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          description_translations: Json | null
          id: string
          image_url: string | null
          is_default: boolean
          is_deleted: boolean
          latitude: number | null
          longitude: number | null
          name_translations: Json
          profile_id: string
          schedule_id: string | null
          state: string | null
          status: Database["public"]["Enums"]["product_status"] | null
          store_status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description_translations?: Json | null
          id?: string
          image_url?: string | null
          is_default?: boolean
          is_deleted?: boolean
          latitude?: number | null
          longitude?: number | null
          name_translations?: Json
          profile_id: string
          schedule_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["product_status"] | null
          store_status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description_translations?: Json | null
          id?: string
          image_url?: string | null
          is_default?: boolean
          is_deleted?: boolean
          latitude?: number | null
          longitude?: number | null
          name_translations?: Json
          profile_id?: string
          schedule_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["product_status"] | null
          store_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_kiosqs_schedule_id"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kiosqs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          id: string
          is_tax_inclusive: boolean | null
          updated_at: string
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
          id?: string
          is_tax_inclusive?: boolean | null
          updated_at?: string
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
          id?: string
          is_tax_inclusive?: boolean | null
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
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
          quantity: number | null
          sku: string | null
          unit: string | null
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
          quantity?: number | null
          sku?: string | null
          unit?: string | null
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
          quantity?: number | null
          sku?: string | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
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
          category_id: string | null
          checklist_translations: Json | null
          created_at: string
          description_translations: Json | null
          id: string
          is_deleted: boolean
          is_featured: boolean | null
          name_translations: Json
          profile_id: string
          status: Database["public"]["Enums"]["product_status"] | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category_id?: string | null
          checklist_translations?: Json | null
          created_at?: string
          description_translations?: Json | null
          id?: string
          is_deleted?: boolean
          is_featured?: boolean | null
          name_translations?: Json
          profile_id: string
          status?: Database["public"]["Enums"]["product_status"] | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category_id?: string | null
          checklist_translations?: Json | null
          created_at?: string
          description_translations?: Json | null
          id?: string
          is_deleted?: boolean
          is_featured?: boolean | null
          name_translations?: Json
          profile_id?: string
          status?: Database["public"]["Enums"]["product_status"] | null
          updated_at?: string
          updated_by?: string | null
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
            foreignKeyName: "products_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
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
          description_translations: Json | null
          facebook_page_url: string | null
          id: string
          instagram_page_url: string | null
          is_active: boolean | null
          is_deleted: boolean
          is_reviewed: boolean | null
          name_translations: Json | null
          profile_image: string | null
          slug_translations: Json | null
          tiktok_page_url: string | null
          type: Database["public"]["Enums"]["profile_type"] | null
          updated_at: string
          updated_by: string | null
          user_id: string
          x_page_url: string | null
        }
        Insert: {
          banner_image?: string | null
          created_at?: string
          description_translations?: Json | null
          facebook_page_url?: string | null
          id?: string
          instagram_page_url?: string | null
          is_active?: boolean | null
          is_deleted?: boolean
          is_reviewed?: boolean | null
          name_translations?: Json | null
          profile_image?: string | null
          slug_translations?: Json | null
          tiktok_page_url?: string | null
          type?: Database["public"]["Enums"]["profile_type"] | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
          x_page_url?: string | null
        }
        Update: {
          banner_image?: string | null
          created_at?: string
          description_translations?: Json | null
          facebook_page_url?: string | null
          id?: string
          instagram_page_url?: string | null
          is_active?: boolean | null
          is_deleted?: boolean
          is_reviewed?: boolean | null
          name_translations?: Json | null
          profile_image?: string | null
          slug_translations?: Json | null
          tiktok_page_url?: string | null
          type?: Database["public"]["Enums"]["profile_type"] | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          x_page_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          friday_close_time: number | null
          friday_is_open: boolean
          friday_open_time: number | null
          friday_pauses: Json | null
          id: string
          is_default: boolean
          monday_close_time: number | null
          monday_is_open: boolean
          monday_open_time: number | null
          monday_pauses: Json | null
          name_translations: Json
          profile_id: string
          saturday_close_time: number | null
          saturday_is_open: boolean
          saturday_open_time: number | null
          saturday_pauses: Json | null
          sunday_close_time: number | null
          sunday_is_open: boolean
          sunday_open_time: number | null
          sunday_pauses: Json | null
          thursday_close_time: number | null
          thursday_is_open: boolean
          thursday_open_time: number | null
          thursday_pauses: Json | null
          timezone: string
          tuesday_close_time: number | null
          tuesday_is_open: boolean
          tuesday_open_time: number | null
          tuesday_pauses: Json | null
          updated_at: string
          updated_by: string | null
          wednesday_close_time: number | null
          wednesday_is_open: boolean
          wednesday_open_time: number | null
          wednesday_pauses: Json | null
        }
        Insert: {
          created_at?: string
          friday_close_time?: number | null
          friday_is_open?: boolean
          friday_open_time?: number | null
          friday_pauses?: Json | null
          id?: string
          is_default?: boolean
          monday_close_time?: number | null
          monday_is_open?: boolean
          monday_open_time?: number | null
          monday_pauses?: Json | null
          name_translations?: Json
          profile_id: string
          saturday_close_time?: number | null
          saturday_is_open?: boolean
          saturday_open_time?: number | null
          saturday_pauses?: Json | null
          sunday_close_time?: number | null
          sunday_is_open?: boolean
          sunday_open_time?: number | null
          sunday_pauses?: Json | null
          thursday_close_time?: number | null
          thursday_is_open?: boolean
          thursday_open_time?: number | null
          thursday_pauses?: Json | null
          timezone?: string
          tuesday_close_time?: number | null
          tuesday_is_open?: boolean
          tuesday_open_time?: number | null
          tuesday_pauses?: Json | null
          updated_at?: string
          updated_by?: string | null
          wednesday_close_time?: number | null
          wednesday_is_open?: boolean
          wednesday_open_time?: number | null
          wednesday_pauses?: Json | null
        }
        Update: {
          created_at?: string
          friday_close_time?: number | null
          friday_is_open?: boolean
          friday_open_time?: number | null
          friday_pauses?: Json | null
          id?: string
          is_default?: boolean
          monday_close_time?: number | null
          monday_is_open?: boolean
          monday_open_time?: number | null
          monday_pauses?: Json | null
          name_translations?: Json
          profile_id?: string
          saturday_close_time?: number | null
          saturday_is_open?: boolean
          saturday_open_time?: number | null
          saturday_pauses?: Json | null
          sunday_close_time?: number | null
          sunday_is_open?: boolean
          sunday_open_time?: number | null
          sunday_pauses?: Json | null
          thursday_close_time?: number | null
          thursday_is_open?: boolean
          thursday_open_time?: number | null
          thursday_pauses?: Json | null
          timezone?: string
          tuesday_close_time?: number | null
          tuesday_is_open?: boolean
          tuesday_open_time?: number | null
          tuesday_pauses?: Json | null
          updated_at?: string
          updated_by?: string | null
          wednesday_close_time?: number | null
          wednesday_is_open?: boolean
          wednesday_open_time?: number | null
          wednesday_pauses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_updated_by_fkey"
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
          first_name: string | null
          id: string
          interests: string[]
          is_deleted: boolean
          is_onboarded: boolean
          last_name: string | null
          latitude: number | null
          longitude: number | null
          postal_code: string | null
          role: Database["public"]["Enums"]["user_role"]
          search_radius: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          interests?: string[]
          is_deleted?: boolean
          is_onboarded?: boolean
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          search_radius?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          interests?: string[]
          is_deleted?: boolean
          is_onboarded?: boolean
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          search_radius?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_slug_uniqueness: {
        Args: { new_slug_translations: Json; excluding_profile_id?: string }
        Returns: boolean
      }
      create_vendor_profile: {
        Args: {
          user_id: string
          name_translations: Json
          slug_translations: Json
          description_translations?: Json
          banner_image?: string
        }
        Returns: string
      }
      delete_category: {
        Args: { category_id: string }
        Returns: undefined
      }
      extract_all_slug_values: {
        Args: { slug_translations: Json }
        Returns: string[]
      }
      has_role_permission: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      review_profile: {
        Args: { profile_id: string; set_active: boolean; set_reviewed: boolean }
        Returns: boolean
      }
    }
    Enums: {
      product_status: "published" | "draft" | "deleted"
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
      product_status: ["published", "draft", "deleted"],
      profile_type: ["personal", "vendor"],
      user_role: ["admin", "vendor-admin", "vendor-manager", "user"],
    },
  },
} as const
