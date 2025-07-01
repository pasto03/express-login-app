// index.js
const express = require('express');
const bodyParser = require('body-parser');
const { db, generateId } = require('./database');
const { adminRoutes } = require('./routes/admin');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(adminRoutes);

// 注册接口
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ error: 'Username and password are required.' });

    // 检查用户名是否已存在
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error.' });

        if (row) {
            return res.status(409).json({ error: 'Username already exists.' });
        }

        const id = generateId();

        db.run(
            'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
            [id, username, password],
            (err) => {
                if (err) return res.status(500).json({ error: 'Failed to register user.' });
                return res.status(201).json({ message: 'User registered successfully.', id });
            }
        );
    });
});

// 登录接口
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ error: 'Username and password are required.' });

    db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error.' });

            if (!row) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            // ✅ 登录成功后，记录登录日志
            const ip = req.ip;
            const loginId = generateId();
            db.run(
                'INSERT INTO logins (id, userId, ip) VALUES (?, ?, ?)',
                [loginId, row.id, ip],
                (err) => {
                    if (err) console.error('⚠️ 登录日志记录失败:', err.message);
                }
            );

            return res.status(200).json({ message: 'Login successful.', userId: row.id });
        }
    );
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});