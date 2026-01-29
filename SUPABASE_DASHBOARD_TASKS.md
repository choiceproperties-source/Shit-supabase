# Required Supabase Dashboard Tasks

Now that your database and Edge Function are live, here are the final manual steps to ensure everything is production-ready.

### 1. Verify "clever-action" Configuration
In the Supabase Dashboard, go to **Edge Functions > clever-action**:
- **Verify JWT**: Ensure this is set to **OFF** (as you are handling authorization inside the logic or using it for public submissions).
- **Secrets**: Double-check that `SENDGRID_API_KEY` is added in the **Settings** tab of the function if it wasn't already.

### 2. Enable Storage RLS Policies
Go to **Storage > Buckets > application-documents**:
- Ensure **Public** is set to **No**.
- Click **Policies** and verify you have an "INSERT" policy for **authenticated** users so tenants can upload files.
- Add a "SELECT" policy for **authenticated** users so you can view them in the Admin panel.

### 3. Check Realtime Settings
Go to **Database > Replication**:
- Ensure the `rental_applications` table is toggled **ON** for **Source**. This allows your Admin Dashboard to update automatically when a new application comes in without needing to refresh.

### 4. Admin Account Finalization
Go to **Authentication > Users**:
- If you haven't yet, create your own user account.
- Go to the **SQL Editor** and run:
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE email = 'your-actual-email@hotmail.com';
  ```

### 5. Email Templates (Optional)
Go to **Authentication > Email Templates**:
- You can customize the "Confirm Signup" and "Magic Link" emails here to match your brand's voice and colors.
