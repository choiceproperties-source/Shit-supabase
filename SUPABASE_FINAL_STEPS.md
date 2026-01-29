# Final Supabase Dashboard Checklist

You've deployed the Edge Function and run the SQL. Here are the last few manual steps to make everything work together.

### 1. Create the Storage Bucket
Applicants need a place to upload their IDs and proof of income.
1. Go to **Storage** in the left sidebar.
2. Click **New Bucket**.
3. Name it exactly: `application-documents`.
4. Keep it **Private** (do not toggle Public).
5. Click **Save**.

### 2. Set Storage Policies (Permissions)
Once the bucket is created, you must allow the app to use it.
1. Click on your `application-documents` bucket.
2. Click **Policies** in the top menu.
3. Click **New Policy** for the **SELECT** (Read) operation.
   - Choose **Authenticated** users.
   - Name it "Admin Read".
4. Click **New Policy** for the **INSERT** (Upload) operation.
   - Choose **Authenticated** users.
   - Name it "Applicant Upload".

### 3. Verify Realtime Updates
This allows your admin dashboard to update without refreshing.
1. Go to **Database** > **Replication**.
2. Under "Tables", find `rental_applications`.
3. Ensure the toggle is **ON**.

### 4. Set Your Admin Role
If you have signed up for an account in your app:
1. Go to **SQL Editor**.
2. Run this command (replacing with your email):
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'choicepropertygroup@hotmail.com';
   ```

### 5. Double Check "clever-action" Settings
1. Go to **Edge Functions** > `clever-action` > **Settings**.
2. Ensure **Verify JWT** is **OFF**.

Once these 5 steps are done, your project is 100% complete and fully secured!
