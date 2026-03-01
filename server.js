const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// إعداد قاعدة بيانات بسيطة
const dbPath = path.join(__dirname, 'database.json');
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], posts: [] }));
}

function getDB() { return JSON.parse(fs.readFileSync(dbPath)); }
function saveDB(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

// إعداد رفع الصور
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// تسجيل حساب جديد
app.post('/api/signup', upload.single('avatar'), (req, res) => {
    const { username, password } = req.body;
    const db = getDB();
    if (db.users.find(u => u.username === username)) return res.status(400).json({ error: 'الاسم مستخدم مسبقاً' });
    
    const newUser = {
        username,
        password,
        avatar: req.file ? `/uploads/${req.file.filename}` : null
    };
    db.users.push(newUser);
    saveDB(db);
    res.json({ success: true, user: newUser });
});

// تسجيل الدخول
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = getDB();
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) res.json({ success: true, user });
    else res.status(400).json({ error: 'بيانات غير صحيحة' });
});

// نشر تريد جديد
app.post('/api/posts', upload.fields([{ name: 'itemImage' }, { name: 'wantedImage' }]), (req, res) => {
    const { username, itemName, wantedName, tiktokLink } = req.body;
    const db = getDB();
    
    const newPost = {
        id: Date.now(),
        username,
        itemName,
        wantedName,
        tiktokLink,
        itemImage: req.files['itemImage'] ? `/uploads/${req.files['itemImage'][0].filename}` : '',
        wantedImage: req.files['wantedImage'] ? `/uploads/${req.files['wantedImage'][0].filename}` : ''
    };
    
    db.posts.push(newPost);
    saveDB(db);
    res.json({ success: true, post: newPost });
});

// جلب كل التريدات
app.get('/api/posts', (req, res) => {
    res.json(getDB().posts.reverse());
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
