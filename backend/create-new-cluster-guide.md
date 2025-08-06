# 🚀 Create New MongoDB Atlas Cluster

## Step-by-Step Guide

### 1. Go to MongoDB Atlas
- Open: https://cloud.mongodb.com
- Sign in to your account

### 2. Create New Project (if needed)
- Click "New Project"
- Name: "Yegna Bingo"
- Click "Create Project"

### 3. Build Database
- Click "Build a Database"
- Choose "FREE" tier (M0)
- Select "AWS" as provider
- Choose "N. Virginia (us-east-1)" region
- Click "Create"

### 4. Set Up Database User
- Username: `yegna_bingo_user`
- Password: `YegnaBingo2024!`
- Role: "Read and write to any database"
- Click "Create User"

### 5. Set Up Network Access
- Click "Network Access"
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (0.0.0.0/0)
- Click "Confirm"

### 6. Get Connection String
- Go back to "Database"
- Click "Connect"
- Choose "Connect your application"
- Copy the connection string

### 7. Expected Connection String Format
```
mongodb+srv://yegna_bingo_user:YegnaBingo2024!@cluster0.xxxxx.mongodb.net/yegna-bingo?retryWrites=true&w=majority
```

## 🎯 What to Share
Once you create the new cluster, share:
1. The new connection string
2. Any error messages
3. The cluster name

## ⚡ Quick Test
After creating, run:
```bash
node test-new-connection.js
``` 