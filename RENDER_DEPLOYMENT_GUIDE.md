# Render.com Deployment Guide

## 🚀 Deploying RCP Invoice System to Render

This guide shows how to deploy your Node.js + PostgreSQL application to Render.com

---

## ⚠️ Common Deployment Error

If you see this error during deployment:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**It means**: DATABASE_URL environment variable is not set in Render

---

## ✅ Solution: Set Environment Variables

### **Step-by-Step Instructions**

#### **1. Open Your Render Dashboard**
- Go to: https://dashboard.render.com
- Select your Web Service (the one that's failing)

#### **2. Navigate to Environment**
- Click on **"Environment"** tab
- You should see an **"Add Environment Variable"** button

#### **3. Add DATABASE_URL**
- Click **"Add Environment Variable"**
- Enter these values:

| Field | Value |
|-------|-------|
| **Key** | `DATABASE_URL` |
| **Value** | `postgresql://balasundaram:Ws9dZHa2PcsgyQ8RIaFlL4lkLg3d2FOP@dpg-d71v3l6a2pns73ffn910-a.oregon-postgres.render.com/rcpinvoice` |

#### **4. Save Environment Variable**
- Click the **"Save"** button
- Render will automatically trigger a re-deployment

---

## 📊 Environment Variables Reference

Your Render service needs these environment variables:

```
# Required
DATABASE_URL=postgresql://balasundaram:Ws9dZHa2PcsgyQ8RIaFlL4lkLg3d2FOP@dpg-d71v3l6a2pns73ffn910-a.oregon-postgres.render.com/rcpinvoice

# Optional (automatically set by Render)
PORT=3001
NODE_ENV=production
```

---

## 🔍 Verify Deployment

After re-deploying, check if it worked:

### **1. Wait for Re-deployment**
- Go to **"Logs"** tab in Render
- Wait for "Exited with status 0" or deployment complete message

### **2. Test the API**
Open your Render service URL and add `/api/health`:
```
https://your-service-name.onrender.com/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "RCP Invoice API is running"
}
```

### **3. Test Data Endpoints**
```
https://your-service-name.onrender.com/api/customers
https://your-service-name.onrender.com/api/invoices
```

---

## 🎯 Complete Deployment Checklist

- [ ] GitHub repository connected to Render
- [ ] Web Service created and configured
- [x] DATABASE_URL environment variable added to Render
- [ ] Re-deployment triggered
- [ ] Logs show "Connected to PostgreSQL database"
- [ ] Health check endpoint working
- [ ] API endpoints returning data
- [ ] 11 customers visible
- [ ] 51 invoices visible
- [ ] 140 invoice items in database

---

## 📝 If You Don't Remember Your DATABASE_URL

Your PostgreSQL URL is stored in your `.env` file locally:
```
DATABASE_URL=postgresql://balasundaram:Ws9dZHa2PcsgyQ8RIaFlL4lkLg3d2FOP@dpg-d71v3l6a2pns73ffn910-a.oregon-postgres.render.com/rcpinvoice
```

Copy the entire value (from `postgresql://` to the end) and paste it into Render's environment variable.

---

## 🆘 Troubleshooting

### **Error: ECONNREFUSED**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: DATABASE_URL not set. See "Step-by-Step Instructions" above.

### **Error: ECONNREFUSED to dpg-...**
```
Error: connect ECONNREFUSED dpg-d71v3l6a2pns73ffn910-a.oregon-postgres.render.com
```
**Solution**: DATABASE_URL is set but PostgreSQL on Render is down. Check Render dashboard.

### **Error: password authentication failed**
```
Error: password authentication failed for user "balasundaram"
```
**Solution**: DATABASE_URL has incorrect password. Verify the full URL is correct.

### **Error: database does not exist**
```
Error: database "rcpinvoice" does not exist
```
**Solution**: Database not created yet. This is expected on first deploy. Can be ignored.

### **Service keeps crashing**
```
==> Exited with status 1
```
**Solution**:
1. Check logs for specific error
2. Verify DATABASE_URL is exactly correct (no extra spaces)
3. Verify PostgreSQL database exists on Render

---

## 📈 Manual Re-deployment

If environment variables are set but it still doesn't work:

1. Go to your Service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for logs to show successful connection
4. Test the API

---

## 🔐 Security Notes

⚠️ **Never commit your DATABASE_URL to GitHub!**

- Keep `.env` file local (it's in `.gitignore`)
- Only set DATABASE_URL in Render's dashboard
- Don't share the database password publicly

---

## ✅ After Successful Deployment

Once deployment succeeds:

1. **Share your URL**: `https://your-service-name.onrender.com`
2. **Access the UI**: Open the URL in browser
3. **Test the API**: All endpoints should work
4. **Monitor logs**: Watch for any errors

---

## 📚 Additional Resources

- Render Documentation: https://render.com/docs
- Node.js Deployment: https://render.com/docs/deploy-node
- PostgreSQL on Render: https://render.com/docs/databases
- Environment Variables: https://render.com/docs/environment-variables

---

**If deployment still fails, provide the full error message from Render logs!**
