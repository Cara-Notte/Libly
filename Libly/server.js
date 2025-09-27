const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const bcrypt = require('bcrypt')

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
const USERS_FILE = path.join(__dirname, 'users.json')

let users = []

function loadUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8')
            users = JSON.parse(data)
            console.log(`Loaded ${users.length} users from storage`)
        } else {
            console.log('No users file found, starting with empty user list')
        }
    } catch (error) {
        console.error('Error loading users:', error)
        users = []
    }
}

function saveUsers() {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
        console.log(`Saved ${users.length} users to storage`)
    } catch (error) {
        console.error('Error saving users:', error)
    }
}

loadUsers()

app.get('/users', (req, res) => {
  // Remove sensitive information and return only public profile data
  const publicUsers = users.map(user => ({
      username: user.username,
      createdAt: user.createdAt
  }));
  res.json(publicUsers);
})

app.post('/users', async (req, res) => {
    try {
        const existingUser = users.find(u => u.username === req.body.username)
        if (existingUser) {
            return res.status(400).send('Username already exists')
        }

        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        console.log(`New user registered: ${req.body.username}`)
        
        const user = { 
            username: req.body.username, 
            password: hashedPassword,
            createdAt: new Date().toISOString()
        }
        users.push(user)

        saveUsers()
        
        res.status(201).send('User created successfully')
    } catch (error) {
        console.error('Registration error:', error)
        res.status(500).send('Internal server error')
    }
})

app.post('/users/login', async (req, res) => {
    try {
        const user = users.find(u => u.username === req.body.username)
        if (!user) {
            return res.status(400).send('User not found')
        }
        
        const isValid = await bcrypt.compare(req.body.password, user.password)
        if (!isValid) {
            return res.status(400).send('Invalid password')
        }
        
        console.log(`User logged in: ${req.body.username}`)
        res.send('Login successful')
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).send('Internal server error')
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Libly server running on http://0.0.0.0:${PORT}`)
    console.log(`Visit http://0.0.0.0:${PORT} to access the application`)
})