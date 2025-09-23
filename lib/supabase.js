import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jqrzjxvlzchyptgsevrh.supabase.co'
const supabaseAnonKey = '723a8585853c8596a824ec97d4bab4e654bcbe6e4fdca469dcd612fd37d77c08'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to analyze food using the edge function
export const analyzeFood = async (inputType, content, imageData = null) => {
  try {
    console.log('Calling edge function with:', { inputType, content: content.substring(0, 50) + '...' });
    
    // Use Supabase client's invoke method instead of direct fetch
    const { data, error } = await supabase.functions.invoke('ketometer-analysis', {
      body: {
        inputType,
        content,
        imageData
      }
    });

    console.log('Supabase invoke result:', { data, error });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Function error: ${error.message}`);
    }

    if (data?.success === false) {
      console.error('Function returned error:', data.error);
      throw new Error(data.error || 'Function execution failed');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data?.analysis || data;
  } catch (error) {
    console.error('Food analysis error:', error);
    throw error;
  }
};
