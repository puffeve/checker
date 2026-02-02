import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mjgdzihgqddwkqruttmy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qZ2R6aWhncWRkd2txcnV0dG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNzEyOTIsImV4cCI6MjA4NDY0NzI5Mn0._Euv8Lg-UBMO06OwzYnq7FC49KPUluJI3J-excs1uYk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);