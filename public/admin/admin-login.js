import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

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

        loginBtn.disabled = true;
        loginBtn.innerText = 'Authenticating...';
        errorMessage.innerText = '';

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Check if user has admin role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError || profile?.role !== 'admin') {
                await supabase.auth.signOut();
                throw new Error('Unauthorized: Admin access only.');
            }

            // Success - Redirect
            window.location.href = '/admin/index.html';

        } catch (error) {
            errorMessage.innerText = error.message;
            loginBtn.disabled = false;
            loginBtn.innerText = 'Login';
        }
    });
}
