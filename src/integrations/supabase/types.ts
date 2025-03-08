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
      bmi_history: {
        Row: {
          bmi: number
          category: string
          created_at: string
          date: string
          height: number
          id: string
          user_id: string
          weight: number
        }
        Insert: {
          bmi: number
          category: string
          created_at?: string
          date: string
          height: number
          id?: string
          user_id: string
          weight: number
        }
        Update: {
          bmi?: number
          category?: string
          created_at?: string
          date?: string
          height?: number
          id?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      dashboard_views: {
        Row: {
          id: string
          last_interaction: string | null
          sections_viewed: string[] | null
          time_spent: number | null
          user_id: string
          view_date: string
        }
        Insert: {
          id?: string
          last_interaction?: string | null
          sections_viewed?: string[] | null
          time_spent?: number | null
          user_id: string
          view_date?: string
        }
        Update: {
          id?: string
          last_interaction?: string | null
          sections_viewed?: string[] | null
          time_spent?: number | null
          user_id?: string
          view_date?: string
        }
        Relationships: []
      }
      food_comparisons: {
        Row: {
          created_at: string
          date: string
          food1: Json
          food2: Json
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          food1: Json
          food2: Json
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          food1?: Json
          food2?: Json
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meal_recognitions: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          date: string
          fats: number
          id: string
          image_url: string | null
          meal_name: string
          proteins: number
          user_id: string
        }
        Insert: {
          calories: number
          carbs: number
          created_at?: string
          date: string
          fats: number
          id?: string
          image_url?: string | null
          meal_name: string
          proteins: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          date?: string
          fats?: number
          id?: string
          image_url?: string | null
          meal_name?: string
          proteins?: number
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      sleep_data: {
        Row: {
          bed_time: string
          created_at: string
          date: string
          duration: number
          factors: string[] | null
          id: string
          notes: string | null
          quality: number
          user_id: string
          wake_time: string
        }
        Insert: {
          bed_time: string
          created_at?: string
          date: string
          duration: number
          factors?: string[] | null
          id?: string
          notes?: string | null
          quality: number
          user_id: string
          wake_time: string
        }
        Update: {
          bed_time?: string
          created_at?: string
          date?: string
          duration?: number
          factors?: string[] | null
          id?: string
          notes?: string | null
          quality?: number
          user_id?: string
          wake_time?: string
        }
        Relationships: []
      }
      timetable_history: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          schedule: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          schedule: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          schedule?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          activity_data: Json
          activity_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_data: Json
          activity_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json
          activity_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_dashboard_preferences: {
        Row: {
          created_at: string | null
          hidden_widgets: string[] | null
          id: string
          layout_preference: string | null
          theme_preference: string | null
          updated_at: string | null
          user_id: string
          widgets_order: Json | null
        }
        Insert: {
          created_at?: string | null
          hidden_widgets?: string[] | null
          id?: string
          layout_preference?: string | null
          theme_preference?: string | null
          updated_at?: string | null
          user_id: string
          widgets_order?: Json | null
        }
        Update: {
          created_at?: string | null
          hidden_widgets?: string[] | null
          id?: string
          layout_preference?: string | null
          theme_preference?: string | null
          updated_at?: string | null
          user_id?: string
          widgets_order?: Json | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          goal_description: string
          goal_type: string
          id: string
          status: string | null
          target_date: string | null
          target_value: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          goal_description: string
          goal_type: string
          id?: string
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          goal_description?: string
          goal_type?: string
          id?: string
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      widget_interaction_log: {
        Row: {
          data: Json | null
          id: string
          interaction_time: string | null
          interaction_type: string
          user_id: string
          widget_name: string
        }
        Insert: {
          data?: Json | null
          id?: string
          interaction_time?: string | null
          interaction_type: string
          user_id: string
          widget_name: string
        }
        Update: {
          data?: Json | null
          id?: string
          interaction_time?: string | null
          interaction_type?: string
          user_id?: string
          widget_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_users_needing_bmi_reminder: {
        Args: {
          days_threshold: number
        }
        Returns: {
          id: string
          email: string
          name: string
        }[]
      }
      get_users_needing_meal_reminder: {
        Args: {
          days_threshold: number
        }
        Returns: {
          id: string
          email: string
          name: string
        }[]
      }
      get_users_needing_sleep_reminder: {
        Args: {
          days_threshold: number
        }
        Returns: {
          id: string
          email: string
          name: string
        }[]
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
