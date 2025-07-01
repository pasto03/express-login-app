// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// 创建数据库连接（文件存储）
const db = new sqlite3.Database(path.join(__dirname, 'users.sqlite'), (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('成功连接到 SQLite 数据库。');
  }
});

// 创建 users 表
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(12) PRIMARY KEY,
      username VARCHAR(36) NOT NULL UNIQUE,
      password VARCHAR(36) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建 users 表失败:', err.message);
    } else {
      console.log('users 表已准备好。');
    }
  });
});

// 生成一个 12 字符的随机 ID（你之后注册时可使用这个函数）
function generateId() {
  return crypto.randomBytes(6).toString('hex'); // 6 bytes = 12 hex characters
}

module.exports = { db, generateId };