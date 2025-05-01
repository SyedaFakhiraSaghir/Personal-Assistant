const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const multer = require('multer');
// At the top of your file
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const path = require('path');
const fs = require('fs');
// Serve static files from uploads directory

const app = express();
const port = process.env.PORT || 9000;
// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/profile_pictures';

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL database setup
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "dbproj",
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL connection failed:", err.stack);
    process.exit(1);
  }
  console.log("Connected to MySQL.");
  connection.release();
});

// Create tables if they don't exist
const createTables = async () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS signup (
      userId VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      age INT,
      phone_number VARCHAR(20),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS moods (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mood VARCHAR(50) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      userId VARCHAR(200) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS health (
      id INT AUTO_INCREMENT PRIMARY KEY,
      healthTips TEXT NOT NULL,
      steps INT NOT NULL,
      workout TEXT NOT NULL,
      waterIntake INT NOT NULL,
      userId VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS incomes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS user_ingredients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      ingredient_id INT,
      name VARCHAR(255) NOT NULL,
      quantity VARCHAR(50),
      unit VARCHAR(50),
      brand VARCHAR(255),
      recipe_id INT,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      purchased TINYINT(1) DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES signup(userId) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prep_time INT,
  cook_time INT,
  servings INT,
  meal_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES signup(userId) ON DELETE CASCADE
)`,
    // -- Notes table
`CREATE TABLE IF NOT EXISTS events (
    id INT(11) NOT NULL AUTO_INCREMENT,
    event_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue_or_link VARCHAR(255) NOT NULL,
    details TEXT,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS notes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
  //  books -----------quotes
  `CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      genre VARCHAR(100) NOT NULL,
      description TEXT,
      user_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES signup(userId) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS quotes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      text TEXT NOT NULL,
      author VARCHAR(255),
      category VARCHAR(100) NOT NULL,
      source VARCHAR(255),
      user_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES signup(userId) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS book_quote_favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT NOT NULL,
      item_type ENUM('book', 'quote') NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES signup(userId) ON DELETE CASCADE,
      UNIQUE KEY unique_favorite (user_id, item_id, item_type)
    )`,
    
    `CREATE TABLE IF NOT EXISTS book_quote_notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT NOT NULL,
      item_type ENUM('book', 'quote') NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES signup(userId) ON DELETE CASCADE
    )`,
    `
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  module ENUM('events', 'tasks', 'health', 'finance', 'mood', 'other') NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  due_date DATE,
  due_time TIME,
  is_completed BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(100),
  notification_method ENUM('in-app', 'email', 'both') DEFAULT 'in-app',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES signup(userId) ON DELETE CASCADE,
  INDEX idx_user_module (userId, module),
  INDEX idx_due_date (due_date),
  INDEX idx_completed (is_completed)
)`,`CREATE TABLE IF NOT EXISTS user_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES signup(userId) ON DELETE CASCADE
)`
  ];

  try {
    for (const table of tables) {
      await new Promise((resolve, reject) => {
        db.query(table, (err) => {
          if (err) {
            console.error(`Error creating table: ${err.message}`);
            reject(err);
          } else {
            console.log(`Table created successfully: ${table.split(' ')[5]}`);
            resolve();
          }
        });
      });
    }
    console.log("All tables checked/created successfully");
  } catch (err) {
    console.error("Error creating tables:", err);
    process.exit(1);
  }
};

// Call the function to create tables
createTables();

// Middleware to validate userId
const validateUserId = (req, res, next) => {
  const userId = req.query.userId || req.body.userId;
  
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  db.query(
    `SELECT userId FROM signup WHERE userId = ?`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error validating user:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      req.userId = userId;
      next();
    }
  );
};

// User Authentication Routes
// User Authentication Routes
app.post("/signup", async (req, res) => {
  const { name, email, password, age, phone_number } = req.body;
  const userId = uuidv4();

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    const sql = "INSERT INTO signup (userId, name, email, password, age, phone_number) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [userId, name, email, password, age, phone_number], (err) => {
      if (err) {
        console.error("MySQL error:", err);
        return res.status(500).json({ message: "MySQL error", error: err.message });
      }
      res.status(201).json({ message: "User created successfully", userId });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const sql = "SELECT userId FROM signup WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    if (results.length > 0) {
      const { userId } = results[0];
      return res.status(200).json({ message: "Login successful", userId });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  });
});

// ------------------------------------ notification reminder

app.post('/api/notifications', validateUserId, (req, res) => {
  const { userId } = req;
  const {
    module, type, title, message, priority,
    due_date, due_time, is_recurring, recurrence_pattern,
    notification_method
  } = req.body;

  if (!module || !type || !title || !message) {
    return res.status(400).json({ error: 'Module, type, title, and message are required' });
  }

  const query = `
    INSERT INTO notifications 
    (userId, module, type, title, message, priority, due_date, due_time, 
     is_recurring, recurrence_pattern, notification_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, 
    [
      userId, module, type, title, message, priority || 'medium',
      due_date, due_time, is_recurring || false, recurrence_pattern || null,
      notification_method || 'in-app'
    ], 
    (err, result) => {
      if (err) {
        console.error('Error creating notification:', err);
        return res.status(500).json({ error: 'Failed to create notification' });
      }
      res.status(201).json({ 
        message: 'Notification created successfully',
        notification: {
          id: result.insertId,
          ...req.body,
          userId,
          is_completed: false
        }
      });
    }
  );
});

// Get upcoming notifications (for dashboard)
app.get('/api/notifications/upcoming', validateUserId, (req, res) => {
  const { userId } = req;
  const { limit = 5 } = req.query;
  
  const currentDate = new Date().toISOString().split('T')[0];
  
  const query = `
    SELECT * FROM notifications 
    WHERE userId = ? 
    AND is_completed = FALSE
    AND (due_date IS NULL OR due_date >= ?)
    ORDER BY 
      CASE priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
        ELSE 4
      END,
      due_date ASC,
      due_time ASC
    LIMIT ?
  `;
  
  db.query(query, [userId, currentDate, parseInt(limit)], (err, results) => {
    if (err) {
      console.error('Error fetching upcoming notifications:', err);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
    res.json(results);
  });
});

// Get notifications by module
app.get('/api/notifications/module/:module', validateUserId, (req, res) => {
  const { userId } = req;
  const { module } = req.params;
  const { completed, priority } = req.query;
  
  let query = `
    SELECT * FROM notifications 
    WHERE userId = ? 
    AND module = ?
  `;
  
  const params = [userId, module];
  
  if (completed === 'false') {
    query += ' AND is_completed = FALSE';
  } else if (completed === 'true') {
    query += ' AND is_completed = TRUE';
  }
  
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  
  query += ' ORDER BY due_date, due_time';
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching module notifications:', err);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
    res.json(results);
  });
});

// Snooze notification
app.put('/api/notifications/:id/snooze', validateUserId, (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const { days = 1, hours = 0 } = req.body;
  
  db.query(
    `UPDATE notifications 
     SET due_date = DATE_ADD(COALESCE(due_date, CURDATE()), INTERVAL ? DAY),
         due_time = TIME_ADD(COALESCE(due_time, CURTIME()), INTERVAL ? HOUR)
     WHERE id = ? AND userId = ? AND is_completed = FALSE`,
    [days, hours, id, userId],
    (err, result) => {
      if (err) {
        console.error('Error snoozing notification:', err);
        return res.status(500).json({ error: 'Failed to snooze notification' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Notification not found or already completed' });
      }
      res.json({ message: 'Notification snoozed successfully' });
    }
  );
});

// ----------------------------Moods Routes
app.post("/api/moods", (req, res) => {
  const { userId, mood, description } = req.body;

  if (!userId || !mood) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = "INSERT INTO moods (userId, mood, description) VALUES (?, ?, ?)";
  db.query(sql, [userId, mood, description], (err, result) => {
    if (err) {
      console.error("Error inserting mood:", err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(201).json({ message: 'Mood saved successfully' });
  });
});

app.get("/api/moods/:userId", (req, res) => {
  const { userId } = req.params;
  const query = "SELECT id, mood, description, created_at FROM moods WHERE userId = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching moods:", err);
      res.status(500).send("Error fetching moods");
    } else {
      res.status(200).json(results);
    }
  });
});

// Health Routes
app.post('/api/health', validateUserId, (req, res) => {
  const { healthTips, steps, workout, waterIntake, id } = req.body;
  const { userId } = req;

  if (!healthTips || !steps || !workout || !waterIntake) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = id
    ? `UPDATE health SET healthTips = ?, steps = ?, workout = ?, waterIntake = ? WHERE id = ? AND userId = ?`
    : `INSERT INTO health (healthTips, steps, workout, waterIntake, userId) VALUES (?, ?, ?, ?, ?)`;

  const params = id
    ? [healthTips, steps, workout, waterIntake, id, userId]
    : [healthTips, steps, workout, waterIntake, userId];

  db.query(query, params, (err) => {
    if (err) {
      console.error('Error saving record:', err);
      return res.status(500).json({ message: 'Failed to save record' });
    }
    res.json({ message: id ? 'Record updated successfully' : 'Record added successfully' });
  });
});
app.put('/api/health/:id', validateUserId, (req, res) => {
  const { healthTips, steps, workout, waterIntake } = req.body;
  const { userId } = req;
  const { id } = req.params;

  const query = `UPDATE health SET healthTips = ?, steps = ?, workout = ?, waterIntake = ? WHERE id = ? AND userId = ?`;
  const params = [healthTips, steps, workout, waterIntake, id, userId];

  db.query(query, params, (err) => {
    if (err) {
      console.error('Error updating record:', err);
      return res.status(500).json({ message: 'Failed to update record' });
    }
    res.json({ message: 'Record updated successfully' });
  });
});

app.get('/api/health', validateUserId, (req, res) => {
  const { userId } = req;

  const query = `SELECT * FROM health WHERE userId = ?`;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching health records:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.json(results);
  });
});

app.delete('/api/health/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in query' });
  }

  const query = `DELETE FROM health WHERE id = ? AND userId = ?`;
  db.query(query, [id, userId], (err, result) => {
    if (err) {
      console.error('Error deleting record:', err);
      return res.status(500).json({ message: 'Error deleting record' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found or unauthorized' });
    }
    res.status(200).json({ message: 'Record deleted successfully' });
  });
});


// Finance Routes
app.get("/api/income", validateUserId, (req, res) => {
  const { userId } = req;
  
  db.query(
    `SELECT COALESCE(SUM(amount), 0) AS income FROM incomes WHERE userId = ?`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching income:", err);
        return res.status(500).json({ error: "Failed to fetch income" });
      }
      res.json({ income: results[0].income });
    }
  );
});

app.post("/api/income", validateUserId, (req, res) => {
  const { userId, amount, date } = req.body;
  
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: "Valid amount is required" });
  }
  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  db.query(
    `INSERT INTO incomes (userId, amount, date) VALUES (?, ?, ?)`,
    [userId, parseFloat(amount), date],
    (err) => {
      if (err) {
        console.error("Error adding income:", err);
        return res.status(500).json({ error: "Failed to add income" });
      }
      res.status(201).json({ message: "Income added successfully" });
    }
  );
});

app.get("/api/expenses", validateUserId, (req, res) => {
  const { userId } = req;
  
  db.query(
    `SELECT id, amount, category, date FROM expenses WHERE userId = ? ORDER BY date DESC`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching expenses:", err);
        return res.status(500).json({ error: "Failed to fetch expenses" });
      }
      res.json(results);
    }
  );
});

app.post("/api/expenses", validateUserId, (req, res) => {
  const { userId, amount, category, date } = req.body;
  
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: "Valid amount is required" });
  }
  if (!category || category.trim() === '') {
    return res.status(400).json({ error: "Category is required" });
  }
  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  db.query(
    `INSERT INTO expenses (userId, amount, category, date) VALUES (?, ?, ?, ?)`,
    [userId, parseFloat(amount), category.trim(), date],
    (err) => {
      if (err) {
        console.error("Error adding expense:", err);
        return res.status(500).json({ error: "Failed to add expense" });
      }
      res.status(201).json({ message: "Expense added successfully" });
    }
  );
});

app.get("/api/remaining-income", validateUserId, (req, res) => {
  const { userId } = req;
  
  db.query(
    `SELECT COALESCE(SUM(amount), 0) AS income FROM incomes WHERE userId = ?`,
    [userId],
    (err, incomeResults) => {
      if (err) {
        console.error("Error calculating income:", err);
        return res.status(500).json({ error: "Failed to calculate income" });
      }
      
      db.query(
        `SELECT COALESCE(SUM(amount), 0) AS expenses FROM expenses WHERE userId = ?`,
        [userId],
        (err, expenseResults) => {
          if (err) {
            console.error("Error calculating expenses:", err);
            return res.status(500).json({ error: "Failed to calculate expenses" });
          }
          
          const remainingIncome = incomeResults[0].income - expenseResults[0].expenses;
          res.json({ remainingIncome });
        }
      );
    }
  );
});


// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  const userId = req.query.userId || req.body.userId;
  
  db.query(
    `SELECT name FROM signup WHERE userId = ?`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error checking admin status:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      if (results[0].name.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      next();
    }
  );
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save to our upload directory
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});
app.put('/profile/:userId/picture', upload.single('profile_picture'), async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get the current picture filename to delete it later
    const [user] = await executeQuery(
      'SELECT profile_picture FROM signup WHERE userId = ?',
      [userId]
    );

    // Update database with new filename
    await executeQuery(
      'UPDATE signup SET profile_picture = ? WHERE userId = ?',
      [req.file.filename, userId]
    );

    // Delete old picture if it exists
    if (user?.profile_picture) {
      const oldPath = path.join(uploadDir, user.profile_picture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    res.json({ 
      success: true,
      message: 'Profile picture updated successfully',
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/profile_pictures/${req.file.filename}`
    });

  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});
app.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get profile data
    const [profile] = await executeQuery(
      `SELECT userId, name, email, age, phone_number, profile_picture, createdAt
       FROM signup WHERE userId = ?`,
      [userId]
    );

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent activities
    const activities = await executeQuery(
      `SELECT activity_type, created_at 
       FROM user_activities 
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      ...profile,
      profile_picture: profile.profile_picture 
        ? `${req.protocol}://${req.get('host')}/uploads/profile_pictures/${profile.profile_picture}`
        : null,
      activities
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});
app.use('/uploads', express.static('uploads'));
// Notes Routes
app.get('/api/notes', validateUserId, (req, res) => {
  const { userId } = req;
  
  db.query(
    'SELECT id, title, description, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching notes:', err);
        return res.status(500).json({ error: 'Failed to fetch notes' });
      }
      res.json(results);
    }
  );
});

// Log activity
app.post('/profile/:userId/activity', async (req, res) => {
  try {
    const { userId } = req.params;
    const { activityType, data } = req.body;

    await executeQuery(
      `INSERT INTO user_activities (user_id, activity_type, activity_data)
       VALUES (?, ?, ?)`,
      [userId, activityType, JSON.stringify(data || {})]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// Get user activities
app.get('/profile/:userId/activities', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const activities = await executeQuery(
      `SELECT activity_type, activity_data, created_at 
       FROM user_activities 
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, parseInt(limit)]
    );

    // Parse JSON data
    const results = activities.map(activity => ({
      ...activity,
      activity_data: activity.activity_data ? JSON.parse(activity.activity_data) : {}
    }));

    res.json(results);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});
// Update the PUT /profile/:userId route to match this:
app.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, age, phone_number } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const result = await executeQuery(
      `UPDATE signup 
       SET name = ?, email = ?, age = ?, phone_number = ?
       WHERE userId = ?`,
      [name, email, age || null, phone_number || null, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: { userId, name, email, age, phone_number }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
app.put('/profile/:userId/password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // 1. Verify current password
    const [user] = await executeQuery(
      'SELECT password FROM signup WHERE userId = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // In a real app, you would use bcrypt.compare here
    if (currentPassword !== user.password) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // 2. Update to new password
    // In production, you should hash the password with bcrypt
    await executeQuery(
      'UPDATE signup SET password = ? WHERE userId = ?',
      [newPassword, userId]
    );

    res.json({ 
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});
// -----------------------notes

app.post('/api/notes', validateUserId, (req, res) => {
  const { userId } = req;
  const { title, description } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  db.query(
    'INSERT INTO notes (title, description, user_id) VALUES (?, ?, ?)',
    [title, description, userId],
    (err, result) => {
      if (err) {
        console.error('Error creating note:', err);
        return res.status(500).json({ error: 'Failed to create note' });
      }
      res.status(201).json({ 
        message: 'Note created successfully',
        id: result.insertId 
      });
    }
  );
});

app.put('/api/notes/:id', validateUserId, (req, res) => {
  const { userId } = req;  // This should come from validateUserId middleware
  const { id } = req.params;
  const { title, description } = req.body;  // Get these from body
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  db.query(
    'UPDATE notes SET title = ?, description = ? WHERE id = ? AND user_id = ?',
    [title, description, id, userId],
    (err, result) => {
      if (err) {
        console.error('Error updating note:', err);
        return res.status(500).json({ error: 'Failed to update note' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Note not found or not owned by user' });
      }
      res.json({ message: 'Note updated successfully' });
    }
  );
});

app.delete('/api/notes/:id', validateUserId, (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  
  db.query(
    'DELETE FROM notes WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, result) => {
      if (err) {
        console.error('Error deleting note:', err);
        return res.status(500).json({ error: 'Failed to delete note' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Note not found or not owned by user' });
      }
      res.json({ message: 'Note deleted successfully' });
    }
  );
});

// Events Routes
app.get('/api/events', validateUserId, (req, res) => {
  const { userId } = req;
  
  db.query(
    'SELECT id, event_name, date, time, venue_or_link, details, created_at, updated_at FROM events WHERE user_id = ? ORDER BY date, time',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching events:', err);
        return res.status(500).json({ error: 'Failed to fetch events' });
      }
      res.json(results);
    }
  );
});

app.post('/api/events', validateUserId, (req, res) => {
  const { userId } = req;
  const { eventName, date, time, venueOrLink, details } = req.body;
  
  if (!eventName || !date || !time || !venueOrLink) {
    return res.status(400).json({ 
      error: 'Event name, date, time, and venue/link are required' 
    });
  }

  db.query(
    'INSERT INTO events (event_name, date, time, venue_or_link, details, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [eventName, date, time, venueOrLink, details, userId],
    (err, result) => {
      if (err) {
        console.error('Error creating event:', err);
        return res.status(500).json({ error: 'Failed to create event' });
      }
      res.status(201).json({ 
        message: 'Event created successfully',
        id: result.insertId 
      });
    }
  );
});

app.put('/api/events/:id', validateUserId, (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const { eventName, date, time, venueOrLink, details } = req.body;
  
  if (!eventName || !date || !time || !venueOrLink) {
    return res.status(400).json({ 
      error: 'Event name, date, time, and venue/link are required' 
    });
  }

  db.query(
    'UPDATE events SET event_name = ?, date = ?, time = ?, venue_or_link = ?, details = ? WHERE id = ? AND user_id = ?',
    [eventName, date, time, venueOrLink, details, id, userId],
    (err, result) => {
      if (err) {
        console.error('Error updating event:', err);
        return res.status(500).json({ error: 'Failed to update event' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Event not found or not owned by user' });
      }
      res.json({ message: 'Event updated successfully' });
    }
  );
});

app.delete('/api/events/:id', validateUserId, (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  
  db.query(
    'DELETE FROM events WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, result) => {
      if (err) {
        console.error('Error deleting event:', err);
        return res.status(500).json({ error: 'Failed to delete event' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'event not found or not owned by user' });
      }
      res.json({ message: 'Event deleted successfully' });
    }
  );
});

// recipe-------------------------------------------
async function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Then keep all your existing route handlers the same

// Routes for Recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const { userId } = req.query;
    const recipes = await executeQuery(
      'SELECT id, title, description, prep_time, cook_time, servings, meal_date, created_at FROM recipes WHERE user_id = ?',
      [userId]
    );
    
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const { title, description, prep_time, cook_time, servings, user_id, meal_date } = req.body;
    
    const result = await executeQuery(
      'INSERT INTO recipes (title, description, prep_time, cook_time, servings, user_id, meal_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, prep_time, cook_time, servings, user_id, meal_date]
    );
    
    res.status(201).json({ 
      message: 'Recipe created successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Failed to create recipe' });
  }
});

// In your PUT /api/recipes/:id route
app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, prep_time, cook_time, servings, user_id, meal_date } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Convert ISO date to MySQL datetime format
    const mysqlDate = meal_date ? new Date(meal_date).toISOString().slice(0, 19).replace('T', ' ') : null;
    
    const result = await executeQuery(
      'UPDATE recipes SET title = ?, description = ?, prep_time = ?, cook_time = ?, servings = ?, meal_date = ? WHERE id = ? AND user_id = ?',
      [title, description, prep_time, cook_time, servings, mysqlDate, id, user_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Recipe not found or not owned by user' });
    }
    
    res.json({ message: 'Recipe updated successfully' });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Failed to update recipe' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const result = await executeQuery(
      'DELETE FROM recipes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Recipe not found or not owned by user' });
    }
    
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Failed to delete recipe' });
  }
});

// Routes for Grocery Items
app.get('/api/grocery', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const items = await executeQuery(
      'SELECT * FROM user_ingredients WHERE user_id = ? ORDER BY added_at DESC',
      [userId]
    );
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching grocery items:', error);
    res.status(500).json({ message: 'Failed to fetch grocery items' });
  }
});

app.post('/api/grocery', async (req, res) => {
  try {
    const { name, quantity, unit, brand, recipe_id, purchased, user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const result = await executeQuery(
      'INSERT INTO user_ingredients (name, quantity, unit, brand, recipe_id, purchased, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, quantity, unit, brand, recipe_id, purchased, user_id]
    );
    
    res.status(201).json({ 
      message: 'Grocery item added successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error adding grocery item:', error);
    res.status(500).json({ message: 'Failed to add grocery item' });
  }
});

app.put('/api/grocery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, brand, recipe_id, purchased, user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const result = await executeQuery(
      'UPDATE user_ingredients SET name = ?, quantity = ?, unit = ?, brand = ?, recipe_id = ?, purchased = ? WHERE id = ? AND user_id = ?',
      [name, quantity, unit, brand, recipe_id, purchased, id, user_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found or not owned by user' });
    }
    
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating grocery item:', error);
    res.status(500).json({ message: 'Failed to update item' });
  }
});

app.patch('/api/grocery/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { purchased, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const result = await executeQuery(
      'UPDATE user_ingredients SET purchased = ? WHERE id = ? AND user_id = ?',
      [purchased, id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found or not owned by user' });
    }
    
    res.json({ message: 'Item status updated successfully' });
  } catch (error) {
    console.error('Error toggling purchased status:', error);
    res.status(500).json({ message: 'Failed to update item status' });
  }
});

app.delete('/api/grocery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const result = await executeQuery(
      'DELETE FROM user_ingredients WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found or not owned by user' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting grocery item:', error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

// --books ==================================
const quotes = [
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  }
];

const booksDatabase = {
  'self-help': [
    {
      title: "Atomic Habits",
      author: "James Clear",
      genre: "self-help",
      reason: "Great for building good habits and breaking bad ones",
      length: "medium"
    },
    {
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen R. Covey",
      genre: "self-help",
      reason: "Timeless principles for personal and professional effectiveness",
      length: "long"
    }
  ],
  'business': [
    {
      title: "Good to Great",
      author: "Jim Collins",
      genre: "business",
      reason: "Explains how companies transition from good to great",
      length: "long"
    },
    {
      title: "Lean Startup",
      author: "Eric Ries",
      genre: "business",
      reason: "Great for entrepreneurs starting new ventures",
      length: "medium"
    }
  ],
  'biography': [
    {
      title: "Steve Jobs",
      author: "Walter Isaacson",
      genre: "biography",
      reason: "Inspirational story of Apple's co-founder",
      length: "long"
    },
    {
      title: "Becoming",
      author: "Michelle Obama",
      genre: "biography",
      reason: "Insightful memoir of the former First Lady",
      length: "medium"
    }
  ],
  'fiction': [
    {
      title: "The Alchemist",
      author: "Paulo Coelho",
      genre: "fiction",
      reason: "Motivational story about pursuing your dreams",
      length: "short"
    },
    {
      title: "Man's Search for Meaning",
      author: "Viktor E. Frankl",
      genre: "fiction",
      reason: "Powerful story about finding purpose in life",
      length: "short"
    }
  ]
};

// Routes
app.get('/api/quotes/random', (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  res.json(quotes[randomIndex]);
});

app.post('/api/books/suggest', (req, res) => {
  const { genre, mood, length } = req.body;
  
  // Filter books based on preferences
  let suggestions = booksDatabase[genre] || [];
  
  // Further filtering based on mood (simplified for example)
  if (mood === 'stressed') {
    suggestions = suggestions.filter(book => book.genre === 'self-help' || book.genre === 'fiction');
  } else if (mood === 'unfocused') {
    suggestions = suggestions.filter(book => book.genre === 'self-help' || book.genre === 'business');
  }
  
  // Filter by length
  suggestions = suggestions.filter(book => book.length === length);
  
  // If no suggestions, return some defaults
  if (suggestions.length === 0) {
    suggestions = booksDatabase['self-help'].slice(0, 2);
  }
  
  // Limit to 3 suggestions
  res.json(suggestions.slice(0, 3));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});