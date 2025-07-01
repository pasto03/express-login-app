const { Parser } = require('json2csv'); // 记得安装 json2csv
const express = require("express");
const {db} = require("../database.js");

const adminRoutes = express.Router();

// 管理员导出用户登录记录为 CSV
adminRoutes.get('/admin/logins/:id', (req, res) => {
    const adminPassword = req.headers.authorization;
    

    // if (!adminPassword || adminPassword.replace("Bearer ", "") !== 'admin') {
    //     return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
    // }

    const userId = req.params.id;

    // 查询模拟的登录记录（在实际中应为 logins 表）
    db.all('SELECT * FROM logins WHERE userId = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'No login records found for this user.' });
        }

        const json2csv = new Parser({ fields: ['id', 'userId', 'timestamp', 'ip'] });
        const csv = json2csv.parse(rows);

        res.header('Content-Type', 'text/csv');
        res.attachment(`user_${userId}_logins.csv`);
        return res.send(csv);
    });
});

module.exports = { adminRoutes };