export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      audit_logs: {
        Row: {
          admin_action: string
          created_at: string
          id: string
          ip_address: unknown
          payload: Json | null
        }
        Insert: {
          admin_action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          payload?: Json | null
        }
        Update: {
          admin_action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          payload?: Json | null
        }
        Relationships: []
      }
      broadcasters: {
        Row: {
          external_url: string | null
          gratuito: boolean
          nome: string
          ordem: number
          slug: string
          tipo: string
        }
        Insert: {
          external_url?: string | null
          gratuito: boolean
          nome: string
          ordem: number
          slug: string
          tipo: string
        }
        Update: {
          external_url?: string | null
          gratuito?: boolean
          nome?: string
          ordem?: number
          slug?: string
          tipo?: string
        }
        Relationships: []
      }
      help_requests: {
        Row: {
          cpf: string | null
          created_at: string
          id: string
          mensagem: string
          nome: string
          resolved_at: string | null
          status: string
          whatsapp: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          id?: string
          mensagem: string
          nome: string
          resolved_at?: string | null
          status?: string
          whatsapp?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          id?: string
          mensagem?: string
          nome?: string
          resolved_at?: string | null
          status?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      league_members: {
        Row: {
          joined_at: string
          league_id: string
          participant_id: string
          status: string
        }
        Insert: {
          joined_at?: string
          league_id: string
          participant_id: string
          status?: string
        }
        Update: {
          joined_at?: string
          league_id?: string
          participant_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_members_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          codigo_convite: string
          created_at: string
          descricao: string | null
          id: string
          is_publica: boolean
          nome: string
          owner_id: string
        }
        Insert: {
          codigo_convite: string
          created_at?: string
          descricao?: string | null
          id?: string
          is_publica?: boolean
          nome: string
          owner_id: string
        }
        Update: {
          codigo_convite?: string
          created_at?: string
          descricao?: string | null
          id?: string
          is_publica?: boolean
          nome?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leagues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      match_broadcasters: {
        Row: {
          broadcaster_slug: string
          match_id: number
        }
        Insert: {
          broadcaster_slug: string
          match_id: number
        }
        Update: {
          broadcaster_slug?: string
          match_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_broadcasters_broadcaster_slug_fkey"
            columns: ["broadcaster_slug"]
            isOneToOne: false
            referencedRelation: "broadcasters"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "match_broadcasters_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          broadcasts_confirmed: boolean
          estadio: string
          fase: string
          grupo: string | null
          id: number
          is_brasil: boolean
          kickoff_at: string
          placar_a: number | null
          placar_b: number | null
          placeholder_a: string | null
          placeholder_b: string | null
          selecao_a_id: number | null
          selecao_b_id: number | null
          updated_at: string
        }
        Insert: {
          broadcasts_confirmed?: boolean
          estadio: string
          fase: string
          grupo?: string | null
          id: number
          is_brasil?: boolean
          kickoff_at: string
          placar_a?: number | null
          placar_b?: number | null
          placeholder_a?: string | null
          placeholder_b?: string | null
          selecao_a_id?: number | null
          selecao_b_id?: number | null
          updated_at?: string
        }
        Update: {
          broadcasts_confirmed?: boolean
          estadio?: string
          fase?: string
          grupo?: string | null
          id?: number
          is_brasil?: boolean
          kickoff_at?: string
          placar_a?: number | null
          placar_b?: number | null
          placeholder_a?: string | null
          placeholder_b?: string | null
          selecao_a_id?: number | null
          selecao_b_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_selecao_a_id_fkey"
            columns: ["selecao_a_id"]
            isOneToOne: false
            referencedRelation: "selecoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_selecao_b_id_fkey"
            columns: ["selecao_b_id"]
            isOneToOne: false
            referencedRelation: "selecoes"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_scores: {
        Row: {
          diff_gols_total: number
          display_name: string
          palpites_validos: number
          participant_id: string
          placares_exatos: number
          pontos_total: number
          updated_at: string
          vencedores_acertados: number
        }
        Insert: {
          diff_gols_total?: number
          display_name?: string
          palpites_validos?: number
          participant_id: string
          placares_exatos?: number
          pontos_total?: number
          updated_at?: string
          vencedores_acertados?: number
        }
        Update: {
          diff_gols_total?: number
          display_name?: string
          palpites_validos?: number
          participant_id?: string
          placares_exatos?: number
          pontos_total?: number
          updated_at?: string
          vencedores_acertados?: number
        }
        Relationships: [
          {
            foreignKeyName: "participant_scores_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          aceite_comunicacoes: boolean
          aceite_regulamento: boolean
          bairro: string
          cpf: string
          created_at: string
          id: string
          idade: number
          instagram: string | null
          nome: string
          updated_at: string
          whatsapp: string
          whatsapp_confirmed_at: string | null
        }
        Insert: {
          aceite_comunicacoes?: boolean
          aceite_regulamento?: boolean
          bairro: string
          cpf: string
          created_at?: string
          id?: string
          idade: number
          instagram?: string | null
          nome: string
          updated_at?: string
          whatsapp: string
          whatsapp_confirmed_at?: string | null
        }
        Update: {
          aceite_comunicacoes?: boolean
          aceite_regulamento?: boolean
          bairro?: string
          cpf?: string
          created_at?: string
          id?: string
          idade?: number
          instagram?: string | null
          nome?: string
          updated_at?: string
          whatsapp?: string
          whatsapp_confirmed_at?: string | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          created_at: string
          id: string
          match_id: number
          participant_id: string
          placar_a: number
          placar_b: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: number
          participant_id: string
          placar_a: number
          placar_b: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: number
          participant_id?: string
          placar_a?: number
          placar_b?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      selecoes: {
        Row: {
          codigo_iso: string
          id: number
          nome: string
        }
        Insert: {
          codigo_iso: string
          id: number
          nome: string
        }
        Update: {
          codigo_iso?: string
          id?: number
          nome?: string
        }
        Relationships: []
      }
      weekly_scores: {
        Row: {
          diff_gols_total: number
          display_name: string
          palpites_validos: number
          participant_id: string
          placares_exatos: number
          pontos: number
          semana: number
          updated_at: string
          vencedores_acertados: number
        }
        Insert: {
          diff_gols_total?: number
          display_name?: string
          palpites_validos?: number
          participant_id: string
          placares_exatos?: number
          pontos?: number
          semana: number
          updated_at?: string
          vencedores_acertados?: number
        }
        Update: {
          diff_gols_total?: number
          display_name?: string
          palpites_validos?: number
          participant_id?: string
          placares_exatos?: number
          pontos?: number
          semana?: number
          updated_at?: string
          vencedores_acertados?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_scores_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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