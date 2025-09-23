#!/bin/bash

# Deploy KetoMeter Edge Function to Supabase
# Make sure you have the Supabase CLI installed and are logged in

echo "🚀 Deploying KetoMeter Analysis Edge Function..."

# Deploy the function to your existing Supabase project
supabase functions deploy ketometer-analysis --project-ref jqrzjxvlzchyptgsevrh

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set your OPENAI_API_KEY environment variable in Supabase dashboard"
echo "2. Test the function using the Supabase dashboard or your app"
echo "3. Update your React Native app to use the new endpoint"
echo ""
echo "🔗 Function URL: https://jqrzjxvlzchyptgsevrh.supabase.co/functions/v1/ketometer-analysis"
