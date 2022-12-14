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
      whitelists: {
        Row: {
          id: string
          address: string
          created_at: string
          twitter: string | null
          discord: string | null
        }
        Insert: {
          id?: string
          address: string
          created_at?: string
          twitter?: string | null
          discord?: string | null
        }
        Update: {
          id?: string
          address?: string
          created_at?: string
          twitter?: string | null
          discord?: string | null
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
