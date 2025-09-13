# Deployment Instructions for Eternavault Backend

## Changes Made:
1. **Fixed Admin Controller**: Updated `confirmDeath` and `rejectDeathConfirmation` to use URL parameters instead of request body
2. **Fixed Email Utility**: Updated export structure for proper import
3. **Fixed Nominee Model**: Simplified address field structure
4. **Added Debugging**: Added console logs to nominee registration

## To Deploy:

### Option 1: Git Push (Recommended)
```bash
cd "C:\Users\oorut\OneDrive\CLG\PROJECTS\EternaVault Backend"
git add .
git commit -m "Fix admin routes and nominee registration"
git push origin main
```

### Option 2: Manual Upload to Render
1. Go to your Render dashboard
2. Find your Eternavault backend service
3. Go to "Manual Deploy" or "Deploy Latest Commit"
4. Trigger a new deployment

## What's Fixed:
- ✅ Admin panel will now work with real backend data
- ✅ Nominee registration 500 error should be resolved
- ✅ Death confirmation will properly update database
- ✅ Email notifications will be sent to nominees

## Test After Deployment:
1. Try nominee registration - should work without 500 error
2. Try admin panel death confirmation - should update database
3. Check admin dashboard stats - should show real data

## Admin Key:
Use `eternavault-admin-2024` as the admin key in the admin panel.
