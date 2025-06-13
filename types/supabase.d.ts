export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      category: {
        Row: {
          createdAt: string | null
          description: string | null
          id: number
          name: string
          slug: string | null
          updatedAt: string | null
          uuid: string | null
        }
        Insert: {
          createdAt?: string | null
          description?: string | null
          id?: number
          name: string
          slug?: string | null
          updatedAt?: string | null
          uuid?: string | null
        }
        Update: {
          createdAt?: string | null
          description?: string | null
          id?: number
          name?: string
          slug?: string | null
          updatedAt?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      jira_squads: {
        Row: {
          created_at: string
          display_name: string
          email_address: string
          id: number
          lead_uuid: string | null
          updated_at: string
          uuid: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email_address: string
          id?: number
          lead_uuid?: string | null
          updated_at?: string
          uuid?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email_address?: string
          id?: number
          lead_uuid?: string | null
          updated_at?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_squad_lead"
            columns: ["lead_uuid"]
            isOneToOne: false
            referencedRelation: "jira_users"
            referencedColumns: ["uuid"]
          },
        ]
      }
      jira_users: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          email_address: string
          id: number
          key: string
          squad_uuid: string | null
          summary: string | null
          updated_at: string
          uuid: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          email_address: string
          id?: number
          key: string
          squad_uuid?: string | null
          summary?: string | null
          updated_at?: string
          uuid?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          email_address?: string
          id?: number
          key?: string
          squad_uuid?: string | null
          summary?: string | null
          updated_at?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "jira_users_squad_uuid_fkey"
            columns: ["squad_uuid"]
            isOneToOne: false
            referencedRelation: "jira_squads"
            referencedColumns: ["uuid"]
          },
        ]
      }
      notifications: {
        Row: {
          createdAt: string | null
          id: number
          message: string
          status: boolean
          updatedAt: string | null
          uuid: string
        }
        Insert: {
          createdAt?: string | null
          id?: number
          message: string
          status?: boolean
          updatedAt?: string | null
          uuid?: string
        }
        Update: {
          createdAt?: string | null
          id?: number
          message?: string
          status?: boolean
          updatedAt?: string | null
          uuid?: string
        }
        Relationships: []
      }
      product: {
        Row: {
          category: number
          createdAt: string | null
          id: number
          picture: string | null
          price: number
          product_name: string
          slug: string | null
          sold_price: number
          updatedAt: string | null
          uuid: string | null
        }
        Insert: {
          category: number
          createdAt?: string | null
          id?: number
          picture?: string | null
          price: number
          product_name: string
          slug?: string | null
          sold_price: number
          updatedAt?: string | null
          uuid?: string | null
        }
        Update: {
          category?: number
          createdAt?: string | null
          id?: number
          picture?: string | null
          price?: number
          product_name?: string
          slug?: string | null
          sold_price?: number
          updatedAt?: string | null
          uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_category"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: {
        Args: { source_column: string }
        Returns: string
      }
      get_category_price_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          category_name: string
          total_products: number
          avg_margin: number
        }[]
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
