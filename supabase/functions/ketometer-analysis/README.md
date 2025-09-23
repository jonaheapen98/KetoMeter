# KetoMeter Analysis Edge Function

This edge function handles all GPT-based nutritional analysis for the KetoMeter app.

## Features

- **Text Analysis**: Analyzes food descriptions from user input
- **Image Analysis**: Processes food images for nutritional analysis  
- **Menu Analysis**: Scans restaurant menus for keto-friendly options
- **Structured Output**: Returns consistent JSON format for all analysis types

## API Endpoint

```
POST /functions/v1/ketometer-analysis
```

## Request Format

```json
{
  "inputType": "text" | "image" | "menu",
  "content": "Food description or menu text",
  "imageData": "base64_encoded_image" // Optional, for image analysis
}
```

## Response Format

```json
{
  "success": true,
  "analysis": {
    "dishName": "Chicken Caesar Salad",
    "ketoScore": 85,
    "scoreComment": "Moderately Keto - fits if customized",
    "breakdown": {
      "base": {
        "ingredients": "Chicken, lettuce, parmesan",
        "status": "very keto",
        "icon": "green"
      },
      "dressing": {
        "description": "Depends on sugar/oil",
        "status": "moderate risk",
        "icon": "yellow"
      },
      "additions": {
        "description": "Croutons",
        "status": "knocks down score significantly",
        "icon": "red"
      }
    },
    "nutritionSnapshot": {
      "calories": "~420 kcal",
      "netCarbs": "9-12g (with croutons) → ~4-5g (without croutons)",
      "protein": "~28g",
      "fat": "~32g",
      "fiber": "~3g"
    },
    "healthNotes": [
      "Croutons = refined carbs (biggest hit to score).",
      "Dressing may contain hidden sugars/seed oils.",
      "Lean protein needs added fat for balance."
    ],
    "servingAdvice": [
      {
        "type": "skip",
        "text": "Skip croutons → score jumps to 85 / 100.",
        "icon": "red"
      },
      {
        "type": "recommend",
        "text": "Use olive oil + lemon instead of bottled Caesar dressing.",
        "icon": "green"
      }
    ],
    "educationalText": "Educational paragraph about keto balance..."
  }
}
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4o access

## Deployment

```bash
# Deploy to your existing Supabase project
supabase functions deploy ketometer-analysis --project-ref jqrzjxvlzchyptgsevrh
```

## Usage in React Native

```javascript
const analyzeFood = async (inputType, content, imageData = null) => {
  const response = await fetch('https://jqrzjxvlzchyptgsevrh.supabase.co/functions/v1/ketometer-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify({
      inputType,
      content,
      imageData
    })
  });
  
  return await response.json();
};
```

## Error Handling

The function returns appropriate HTTP status codes:
- `400`: Missing required fields
- `500`: Internal server error or OpenAI API issues

Error responses include a descriptive error message in the response body.
