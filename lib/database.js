import * as SQLite from 'expo-sqlite';

const DB_NAME = 'ketometer.db';

// Initialize database
export const initDatabase = async () => {
  try {
    console.log('Initializing database with name:', DB_NAME);
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    console.log('Database opened successfully');
    
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
    console.log('analysis_history table created/verified');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('app_settings table created/verified');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_premium (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        is_premium INTEGER DEFAULT 0,
        premium_type TEXT,
        premium_expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('user_premium table created/verified');
    
    // Verify tables exist by checking user_premium table
    const tables = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('All tables in database:', tables);
    
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

// Onboarding functions
export const setOnboardingComplete = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    await db.runAsync(
      `INSERT OR REPLACE INTO app_settings (setting_key, setting_value, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      ['onboarding_complete', 'true']
    );
    
    console.log('Onboarding marked as complete');
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
    throw error;
  }
};

export const isOnboardingComplete = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    const result = await db.getFirstAsync(
      `SELECT setting_value FROM app_settings WHERE setting_key = ?`,
      ['onboarding_complete']
    );
    
    console.log('Database query result:', result);
    console.log('Setting value:', result?.setting_value);
    console.log('Is complete:', result?.setting_value === 'true');
    
    return result?.setting_value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false; // Default to showing onboarding if there's an error
  }
};

export const resetOnboarding = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // First check what's in the database
    const beforeResult = await db.getFirstAsync(
      `SELECT setting_value FROM app_settings WHERE setting_key = ?`,
      ['onboarding_complete']
    );
    console.log('Before reset - Database result:', beforeResult);
    
    // Clear onboarding status
    await db.runAsync(
      `DELETE FROM app_settings WHERE setting_key = ?`,
      ['onboarding_complete']
    );
    
    // Also clear premium status to make user free
    await db.runAsync(`DELETE FROM user_premium`);
    console.log('Premium status cleared - user is now free');
    
    // Verify it was deleted
    const afterResult = await db.getFirstAsync(
      `SELECT setting_value FROM app_settings WHERE setting_key = ?`,
      ['onboarding_complete']
    );
    console.log('After reset - Database result:', afterResult);
    
    console.log('Onboarding state reset successfully');
  } catch (error) {
    console.error('Error resetting onboarding state:', error);
    throw error;
  }
};

export const clearAllSettings = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    await db.runAsync(`DELETE FROM app_settings`);
    await db.runAsync(`DELETE FROM user_premium`);
    
    console.log('All settings cleared successfully');
  } catch (error) {
    console.error('Error clearing all settings:', error);
    throw error;
  }
};

// Premium status functions
export const setPremiumStatus = async (isPremium, premiumType = null, expiresAt = null) => {
  try {
    console.log('setPremiumStatus called with:', { isPremium, premiumType, expiresAt });
    
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    console.log('Database opened for setPremiumStatus');
    
    // First, check if there's an existing record
    const existingRecord = await db.getFirstAsync(`SELECT id FROM user_premium LIMIT 1`);
    console.log('Existing record found:', existingRecord);
    
    if (existingRecord) {
      // Update existing record
      const result = await db.runAsync(
        `UPDATE user_premium 
         SET is_premium = ?, premium_type = ?, premium_expires_at = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [isPremium ? 1 : 0, premiumType, expiresAt, existingRecord.id]
      );
      console.log('Premium status UPDATED in database:', { 
        isPremium, 
        premiumType, 
        expiresAt, 
        recordId: existingRecord.id,
        changes: result.changes 
      });
    } else {
      // Insert new record
      const result = await db.runAsync(
        `INSERT INTO user_premium (is_premium, premium_type, premium_expires_at) 
         VALUES (?, ?, ?)`,
        [isPremium ? 1 : 0, premiumType, expiresAt]
      );
      console.log('Premium status INSERTED in database:', { 
        isPremium, 
        premiumType, 
        expiresAt, 
        newRecordId: result.lastInsertRowId,
        changes: result.changes 
      });
    }
    
    // Verify the update by reading it back
    const verification = await db.getFirstAsync(`SELECT * FROM user_premium ORDER BY updated_at DESC LIMIT 1`);
    console.log('Premium status verification after save:', verification);
    
    if (!verification) {
      throw new Error('Failed to verify premium status save - no record found after insert/update');
    }
    
    if (verification.is_premium !== (isPremium ? 1 : 0)) {
      throw new Error(`Premium status verification failed - expected ${isPremium ? 1 : 0}, got ${verification.is_premium}`);
    }
    
    console.log('Premium status save verified successfully');
    
  } catch (error) {
    console.error('Error setting premium status:', error);
    throw error;
  }
};

export const getPremiumStatus = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    const result = await db.getFirstAsync(`SELECT * FROM user_premium ORDER BY updated_at DESC LIMIT 1`);
    console.log('getPremiumStatus - Database query result:', result);
    
    if (!result) {
      console.log('getPremiumStatus - No premium record found, returning default free status');
      return {
        isPremium: false,
        premiumType: null,
        premiumExpiresAt: null
      };
    }
    
    // Check if premium has expired
    let isPremium = result.is_premium === 1;
    if (isPremium && result.premium_expires_at) {
      const expiresAt = new Date(result.premium_expires_at);
      const now = new Date();
      if (expiresAt < now) {
        isPremium = false;
        // Update the database to reflect expired status
        await setPremiumStatus(false, result.premium_type, result.premium_expires_at);
        console.log('getPremiumStatus - Premium expired, updated database');
      }
    }
    
    const status = {
      isPremium,
      premiumType: result.premium_type,
      premiumExpiresAt: result.premium_expires_at
    };
    
    console.log('getPremiumStatus - Returning status:', status);
    return status;
  } catch (error) {
    console.error('Error getting premium status:', error);
    return {
      isPremium: false,
      premiumType: null,
      premiumExpiresAt: null
    };
  }
};

export const isUserPremium = async () => {
  try {
    const status = await getPremiumStatus();
    return status.isPremium;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};
