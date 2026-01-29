# 📝 Final Information Checklist

Before deploying, ensure you update these placeholders with your actual property and payment details.

### 1. Payment Information (Updated)
Your Zelle and Venmo details are now updated in the code.
- **Email:** `choicepropertygroup@hotmail.com`
- **Venmo:** `@ChoiceProperties`

### 2. SendGrid API Key (Updated)
Your SendGrid API Key is now embedded in the Edge Function code for easy deployment.
- **Key:** `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`

### 4. Admin Account (Post-Deployment)
Once you sign up, you must promote your account to admin.
- **Where:** Supabase SQL Editor.
- **SQL to run:**
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE email = 'your-actual-email@example.com';
  ```

---

### 📂 Quick Search Tip
If you are using a computer later, you can find all remaining placeholders by searching for the word **`choiceproperties`** across all files.
