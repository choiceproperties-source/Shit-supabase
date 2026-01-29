import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase Config - Using the existing project credentials
const supabaseUrl = 'https://pwqjungiwusflcflukeg.supabase.co/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cWp1bmdpd3VzZmxjZmx1a2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDIwODAsImV4cCI6MjA4NTA3ODA4MH0.yq_0LfPc81cq_ptDZGnxbs3RDfhW8PlQaTfYUs_bsLE';
const supabase = createClient(supabaseUrl, supabaseKey);

const loginForm = document.getElementById('adminLoginForm');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // UI Feedback
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        errorMessage.innerText = '';

        try {
            // 1. Authenticate with Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // 2. Verify User Role from the 'profiles' table
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('Profile fetch error:', profileError);
                throw new Error('Could not verify account permissions.');
            }

            if (!profile || profile.role !== 'admin') {
                // If not an admin, sign them out immediately
                await supabase.auth.signOut();
                throw new Error('Access Denied: You do not have administrator privileges.');
            }

            // 3. Success - Store session info if needed and redirect
            // Note: Supabase client handles session persistence automatically in localStorage
            window.location.href = '/admin/index.html';

        } catch (error) {
            // Error handling
            errorMessage.innerText = error.message;
            loginBtn.disabled = false;
            loginBtn.innerText = 'Login';
        }
    });
}

// Check for existing session on page load
async function checkExistingSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        
        if (profile && profile.role === 'admin') {
            window.location.href = '/admin/index.html';
        }
    }
}

checkExistingSession();
