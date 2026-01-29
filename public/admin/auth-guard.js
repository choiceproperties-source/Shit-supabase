import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase Configuration
const supabaseUrl = 'https://pwqjungiwusflcflukeg.supabase.co/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cWp1bmdpd3VzZmxjZmx1a2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDIwODAsImV4cCI6MjA4NTA3ODA4MH0.yq_0LfPc81cq_ptDZGnxbs3RDfhW8PlQaTfYUs_bsLE';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Admin Protection Middleware
 * Redirects to login if user is not authenticated or not an admin.
 */
async function protectAdminRoute() {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            console.warn('No active session found, redirecting to login.');
            window.location.href = '/admin/login.html';
            return;
        }

        // Verify role from profiles table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            console.error('Unauthorized access attempt:', profileError || 'Not an admin');
            await supabase.auth.signOut();
            window.location.href = '/admin/login.html?error=unauthorized';
            return;
        }

        // If we reach here, user is authenticated and is an admin.
        // We can dispatch a custom event to notify other scripts that auth is ready.
        document.dispatchEvent(new CustomEvent('admin-auth-ready', { detail: { supabase, session, profile } }));
        
    } catch (err) {
        console.error('Auth protection error:', err);
        window.location.href = '/admin/login.html';
    }
}

// Execute protection immediately
protectAdminRoute();

// Export for use in other scripts if needed
export { supabase };
