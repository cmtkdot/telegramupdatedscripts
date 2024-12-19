@@ .. @@
 export interface Database {
   public: {
     Tables: {
+      bot_activities: {
+        Row: {
+          id: string
+          event_type: string
+          chat_id: number
+          user_id: string | null
+          message_id: number | null
+          details: Json
+          created_at: string
+        }
+        Insert: {
+          id?: string
+          event_type: string
+          chat_id: number
+          user_id?: string | null
+          message_id?: number | null
+          details?: Json
+          created_at?: string
+        }
+        Update: {
+          id?: string
+          event_type?: string
+          chat_id?: number
+          user_id?: string | null
+          message_id?: number | null
+          details?: Json
+          created_at?: string
+        }
+      }
       channels: {