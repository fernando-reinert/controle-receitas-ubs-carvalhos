import { supabase } from "../lib/supabase";

export const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };
  
  export const fetchData = async (table: string) => {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw new Error(error.message);
    return data;
  };