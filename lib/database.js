import * as SQLite from 'expo-sqlite';

const DB_NAME = 'ketometer.db';

// Initialize database
export const initDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS analysis_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        analysis_type TEXT NOT NULL,
        input_data TEXT,
        analysis_result TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        dish_name TEXT,
        keto_score INTEGER,
        summary TEXT
      );
    `);
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Save analysis to database
export const saveAnalysis = async (analysisType, inputData, analysisResult) => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    let dishName, ketoScore, summary;
    
    if (analysisType === 'menu') {
      // For menu analysis, use different logic
      dishName = 'Menu Analysis';
      ketoScore = null; // No single score for menu analysis
      summary = analysisResult.summary || 'Menu analysis completed';
    } else {
      // For individual food analysis
      dishName = analysisResult.dishName || 'Unknown Dish';
      ketoScore = analysisResult.ketoScore || 0;
      summary = analysisResult.summary || analysisResult.scoreComment || '';
    }
    
    const result = await db.runAsync(
      `INSERT INTO analysis_history 
       (analysis_type, input_data, analysis_result, dish_name, keto_score, summary)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        analysisType,
        JSON.stringify(inputData || {}),
        JSON.stringify(analysisResult || {}),
        dishName,
        ketoScore,
        summary
      ]
    );
    
    console.log('Analysis saved with ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

// Get all analysis history
export const getAllAnalysisHistory = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    const result = await db.getAllAsync(
      `SELECT * FROM analysis_history 
       ORDER BY created_at DESC`
    );
    
    const history = result.map(row => {
      try {
        return {
          id: row.id,
          analysisType: row.analysis_type,
          inputData: JSON.parse(row.input_data || '{}'),
          analysisResult: JSON.parse(row.analysis_result || '{}'),
          createdAt: row.created_at,
          dishName: row.dish_name,
          ketoScore: row.keto_score,
          summary: row.summary
        };
      } catch (error) {
        console.error('Error parsing database row:', error, row);
        return {
          id: row.id,
          analysisType: row.analysis_type,
          inputData: {},
          analysisResult: {},
          createdAt: row.created_at,
          dishName: row.dish_name || 'Unknown',
          ketoScore: row.keto_score,
          summary: row.summary || 'No summary available'
        };
      }
    });
    
    return history;
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    throw error;
  }
};

// Get analysis by ID
export const getAnalysisById = async (id) => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    const result = await db.getFirstAsync(
      `SELECT * FROM analysis_history WHERE id = ?`,
      [id]
    );
    
    if (result) {
      try {
        return {
          id: result.id,
          analysisType: result.analysis_type,
          inputData: JSON.parse(result.input_data || '{}'),
          analysisResult: JSON.parse(result.analysis_result || '{}'),
          createdAt: result.created_at,
          dishName: result.dish_name,
          ketoScore: result.keto_score,
          summary: result.summary
        };
      } catch (error) {
        console.error('Error parsing analysis result:', error, result);
        return {
          id: result.id,
          analysisType: result.analysis_type,
          inputData: {},
          analysisResult: {},
          createdAt: result.created_at,
          dishName: result.dish_name || 'Unknown',
          ketoScore: result.keto_score,
          summary: result.summary || 'No summary available'
        };
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching analysis by ID:', error);
    throw error;
  }
};

// Delete analysis by ID
export const deleteAnalysis = async (id) => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    const result = await db.runAsync(
      `DELETE FROM analysis_history WHERE id = ?`,
      [id]
    );
    
    console.log('Analysis deleted:', result.changes);
    return result.changes;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
};

// Clear all history
export const clearAllHistory = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    const result = await db.runAsync(
      `DELETE FROM analysis_history`
    );
    
    console.log('All history cleared:', result.changes);
    return result.changes;
  } catch (error) {
    console.error('Error clearing all history:', error);
    throw error;
  }
};

// Get analysis type display info
export const getAnalysisTypeInfo = (analysisType) => {
  switch (analysisType) {
    case 'text':
      return {
        label: 'Text Input',
        icon: 'type',
        color: '#4CAF50'
      };
    case 'image':
      return {
        label: 'Food Photo',
        icon: 'camera',
        color: '#2196F3'
      };
    case 'menu':
      return {
        label: 'Menu Scan',
        icon: 'book-open',
        color: '#FF9800'
      };
    default:
      return {
        label: 'Unknown',
        icon: 'help-circle',
        color: '#9E9E9E'
      };
  }
};

// Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 365) {
    return `${diffInDays}d ago`;
  } else {
    return `${diffInYears}y ago`;
  }
};
