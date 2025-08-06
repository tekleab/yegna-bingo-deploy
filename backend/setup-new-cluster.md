# 🚀 Setup New MongoDB Atlas Cluster

## 📋 Step-by-Step Instructions

### 1. **Create Account/Login**
- Go to: https://cloud.mongodb.com
- Sign up or login with your account

### 2. **Create New Cluster**
- Click **"Build a Database"**
- Choose **"FREE"** tier (M0)
- Select **"AWS"** as provider
- Choose **"N. Virginia (us-east-1)"** region
- Click **"Create"**

### 3. **Database Access Setup**
- Click **"Database Access"**
- Click **"Add New Database User"**
- Username: `yegna_bingo_user`
- Password: `YegnaBingo2024!`
- Role: **"Read and write to any database"**
- Click **"Add User"**

### 4. **Network Access Setup**
- Click **"Network Access"**
- Click **"Add IP Address"**
- Click **"Allow Access from Anywhere"**
- Click **"Confirm"**

### 5. **Get Connection String**
- Go back to **"Database"** tab
- Click **"Connect"** on your cluster
- Choose **"Connect your application"**
- Copy the connection string

### 6. **Update Connection String**
Replace `<password>` with: `YegnaBingo2024!`
Replace `<dbname>` with: `yegna-bingo`

## 📞 Example Connection String:
```
mongodb+srv://yegna_bingo_user:YegnaBingo2024!@cluster0.xxxxx.mongodb.net/yegna-bingo
```

## 🔧 After Setup:
1. Share the new connection string with me
2. I'll update the backend configuration
3. Start the backend server
4. Test the connection

## ⚡ Quick Commands (After Setup):
```bash
# Test connection
node test-mongo.js

# Start backend
npm start

# Check health
curl http://localhost:5000/health
```

**Let me know when you've created the cluster and I'll help you configure it!** 🎯 