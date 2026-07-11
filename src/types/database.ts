export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          role: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          custom_design_path: string | null;
          customization_data: Json | null;
          id: string;
          is_custom: boolean;
          line_total: number;
          order_id: string;
          pin_size_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          custom_design_path?: string | null;
          customization_data?: Json | null;
          id?: string;
          is_custom?: boolean;
          line_total: number;
          order_id: string;
          pin_size_id: string;
          product_id?: string | null;
          quantity?: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          custom_design_path?: string | null;
          customization_data?: Json | null;
          id?: string;
          is_custom?: boolean;
          line_total?: number;
          order_id?: string;
          pin_size_id?: string;
          product_id?: string | null;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_pin_size_id_fkey";
            columns: ["pin_size_id"];
            isOneToOne: false;
            referencedRelation: "pin_sizes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      order_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status: string | null;
          id: string;
          note: string | null;
          order_id: string;
          to_status: string;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          note?: string | null;
          order_id: string;
          to_status: string;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          note?: string | null;
          order_id?: string;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          admin_notes: string | null;
          created_at: string;
          currency: string;
          customer_email: string;
          customer_name: string | null;
          customer_notes: string | null;
          customer_phone: string;
          id: string;
          order_number: string;
          order_type: Database["public"]["Enums"]["order_type"];
          shipping_address: Json | null;
          shipping_cost: number;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total_amount: number;
          updated_at: string;
          user_id: string | null;
          shipping_method_id: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          created_at?: string;
          currency?: string;
          customer_email: string;
          customer_name?: string | null;
          customer_notes?: string | null;
          customer_phone: string;
          id?: string;
          order_number?: string;
          order_type: Database["public"]["Enums"]["order_type"];
          shipping_address?: Json | null;
          shipping_cost?: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total_amount?: number;
          updated_at?: string;
          user_id?: string | null;
          shipping_method_id?: string | null;
        };
        Update: {
          admin_notes?: string | null;
          created_at?: string;
          currency?: string;
          customer_email?: string;
          customer_name?: string | null;
          customer_notes?: string | null;
          customer_phone?: string;
          id?: string;
          order_number?: string;
          order_type?: Database["public"]["Enums"]["order_type"];
          shipping_address?: Json | null;
          shipping_cost?: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total_amount?: number;
          updated_at?: string;
          user_id?: string | null;
          shipping_method_id?: string | null;
        };
        Relationships: [];
      };
      payment_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          payload: Json;
          payment_id: string;
          paypal_event_id: string | null;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          payload?: Json;
          payment_id: string;
          paypal_event_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          payload?: Json;
          payment_id?: string;
          paypal_event_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          fee_amount: number | null;
          id: string;
          order_id: string;
          paid_at: string | null;
          payer_email: string | null;
          payer_name: string | null;
          paypal_capture_id: string | null;
          paypal_order_id: string | null;
          paypal_payer_id: string | null;
          provider: string;
          raw_capture_response: Json | null;
          raw_create_response: Json | null;
          status: Database["public"]["Enums"]["payment_status"];
          updated_at: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          currency?: string;
          fee_amount?: number | null;
          id?: string;
          order_id: string;
          paid_at?: string | null;
          payer_email?: string | null;
          payer_name?: string | null;
          paypal_capture_id?: string | null;
          paypal_order_id?: string | null;
          paypal_payer_id?: string | null;
          provider?: string;
          raw_capture_response?: Json | null;
          raw_create_response?: Json | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          fee_amount?: number | null;
          id?: string;
          order_id?: string;
          paid_at?: string | null;
          payer_email?: string | null;
          payer_name?: string | null;
          paypal_capture_id?: string | null;
          paypal_order_id?: string | null;
          paypal_payer_id?: string | null;
          provider?: string;
          raw_capture_response?: Json | null;
          raw_create_response?: Json | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      pin_sizes: {
        Row: {
          base_price: number;
          custom_price: number | null;
          created_at: string;
          description: string | null;
          diameter_mm: number;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          base_price?: number;
          custom_price?: number | null;
          created_at?: string;
          description?: string | null;
          diameter_mm: number;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          base_price?: number;
          custom_price?: number | null;
          created_at?: string;
          description?: string | null;
          diameter_mm?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      shipping_methods: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          carrier: string;
          delivery_type: string;
          estimated_days: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price?: number;
          carrier?: string;
          delivery_type?: string;
          estimated_days?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          carrier?: string;
          delivery_type?: string;
          estimated_days?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customer_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hero_slides: {
        Row: {
          background_path: string;
          created_at: string;
          cta_label: string | null;
          id: string;
          is_active: boolean;
          product_id: string;
          product_position: string;
          sort_order: number;
          subtitle_override: string | null;
          title_override: string | null;
          updated_at: string;
        };
        Insert: {
          background_path: string;
          created_at?: string;
          cta_label?: string | null;
          id?: string;
          is_active?: boolean;
          product_id: string;
          product_position?: string;
          sort_order?: number;
          subtitle_override?: string | null;
          title_override?: string | null;
          updated_at?: string;
        };
        Update: {
          background_path?: string;
          created_at?: string;
          cta_label?: string | null;
          id?: string;
          is_active?: boolean;
          product_id?: string;
          product_position?: string;
          sort_order?: number;
          subtitle_override?: string | null;
          title_override?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hero_slides_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_groups: {
        Row: {
          background_path: string | null;
          cover_path: string | null;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          background_path?: string | null;
          cover_path?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          background_path?: string | null;
          cover_path?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_typologies: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          id: string;
          is_primary: boolean;
          product_id: string;
          sort_order: number;
          storage_path: string;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          product_id: string;
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          product_id?: string;
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          author: string | null;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          name: string;
          pin_size_id: string;
          price: number;
          product_group_id: string | null;
          product_typology_id: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          sort_order: number;
          stock_quantity: number | null;
          updated_at: string;
        };
        Insert: {
          author?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          name: string;
          pin_size_id: string;
          price: number;
          product_group_id?: string | null;
          product_typology_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          sort_order?: number;
          stock_quantity?: number | null;
          updated_at?: string;
        };
        Update: {
          author?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          name?: string;
          pin_size_id?: string;
          price?: number;
          product_group_id?: string | null;
          product_typology_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          sort_order?: number;
          stock_quantity?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_pin_size_id_fkey";
            columns: ["pin_size_id"];
            isOneToOne: false;
            referencedRelation: "pin_sizes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_product_group_id_fkey";
            columns: ["product_group_id"];
            isOneToOne: false;
            referencedRelation: "product_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_product_typology_id_fkey";
            columns: ["product_typology_id"];
            isOneToOne: false;
            referencedRelation: "product_typologies";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value?: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      order_status:
        | "pending_payment"
        | "paid"
        | "accepted"
        | "in_production"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded";
      order_type: "catalog" | "custom" | "mixed";
      payment_status:
        | "created"
        | "approved"
        | "captured"
        | "failed"
        | "refunded"
        | "partially_refunded";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

export type ProductWithImages = Tables<"products"> & {
  product_images: Tables<"product_images">[];
  pin_sizes: Tables<"pin_sizes"> | null;
  product_groups?: Tables<"product_groups"> | null;
  product_typologies?: Tables<"product_typologies"> | null;
};

export type HeroSlideWithProduct = Tables<"hero_slides"> & {
  products: ProductWithImages | null;
};

export type FinishEffect =
  | "glossy"
  | "matte"
  | "holographic"
  | "glitter"
  | "rainbow"
  | "soft_touch"
  | "epoxy_dome";

export type CustomizationData = {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  finishEffect?: FinishEffect;
};

export type SocialLinks = {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  threads?: string;
};
