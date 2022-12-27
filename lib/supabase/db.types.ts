export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      raffle: {
        Row: {
          id: number
          created_at: string | null
          live_tz: string | null
          end_tz: string | null
          name: string | null
          chain: string | null
          ticket_price: string | null
          ticket_max: number | null
          creator_name: string | null
          creator_avatar: string | null
          image: string | null
        }
        Insert: {
          id?: number
          created_at?: string | null
          live_tz?: string | null
          end_tz?: string | null
          name?: string | null
          chain?: string | null
          ticket_price?: string | null
          ticket_max?: number | null
          creator_name?: string | null
          creator_avatar?: string | null
          image?: string | null
        }
        Update: {
          id?: number
          created_at?: string | null
          live_tz?: string | null
          end_tz?: string | null
          name?: string | null
          chain?: string | null
          ticket_price?: string | null
          ticket_max?: number | null
          creator_name?: string | null
          creator_avatar?: string | null
          image?: string | null
        }
      }
      whitelist: {
        Row: {
          id: string
          address: string
          created_at: string
          twitter: string | null
          discord: string | null
          raffle_id: number
        }
        Insert: {
          id?: string
          address: string
          created_at?: string
          twitter?: string | null
          discord?: string | null
          raffle_id: number
        }
        Update: {
          id?: string
          address?: string
          created_at?: string
          twitter?: string | null
          discord?: string | null
          raffle_id?: number
        }
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
  }
}
