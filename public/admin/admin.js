document.addEventListener('DOMContentLoaded', async () => {
    // Supabase Config
    const config = {
        URL: "https://pwqjungiwusflcflukeg.supabase.co/",
        KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cWp1bmdpd3VzZmxjZmx1a2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDIwODAsImV4cCI6MjA4NTA3ODA4MH0.yq_0LfPc81cq_ptDZGnxbs3RDfhW8PlQaTfYUs_bsLE"
    };
    const supabase = window.supabase.createClient(config.URL, config.KEY);

    // Admin Route Protection
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/admin/login.html';
        return;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        window.location.href = '/admin/login.html?error=unauthorized';
        return;
    }

    const isDetail = window.location.pathname.includes('application.html');
    if (isDetail) {
        if (typeof AdminDetail !== 'undefined') {
            new AdminDetail(supabase).init();
        } else {
            console.error('AdminDetail class not found');
        }
    } else {
        if (typeof AdminList !== 'undefined') {
            new AdminList(supabase).init();
        } else {
            console.error('AdminList class not found');
        }
    }
});

class AdminList {
    constructor(supabase) {
        this.supabase = supabase;
    }

    async init() {
        try {
            const { data, error } = await this.supabase
                .from('rental_applications')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            this.renderTable(data);
        } catch (err) {
            console.error('Supabase admin fetch error:', err);
        }
    }

    renderTable(apps) {
        const tbody = document.getElementById('applicationTableBody');
        tbody.innerHTML = apps.map(app => `
            <tr>
                <td><code>${app.application_id.substring(0, 8)}</code></td>
                <td><strong>${app.applicant_name}</strong></td>
                <td>${app.property_address || 'N/A'}</td>
                <td><span class="badge status-${app.application_status}">${app.application_status.replace('_', ' ')}</span></td>
                <td><span class="badge pay-${app.payment_status}">${app.payment_status}</span></td>
                <td>${new Date(app.created_at).toLocaleDateString()}</td>
                <td>
                    <a href="application.html?id=${app.application_id}" class="btn-primary" style="text-decoration: none; font-size: 0.8rem;">View</a>
                </td>
            </tr>
        `).join('');
    }
}

class AdminDetail {
    constructor(supabase) {
        this.supabase = supabase;
        this.appId = new URLSearchParams(window.location.search).get('id');
        this.currentApp = null;
    }

    async init() {
        if (!this.appId) return;
        try {
            const { data, error } = await this.supabase
                .from('rental_applications')
                .select('*')
                .eq('application_id', this.appId)
                .single();
                
            if (error) throw error;
            this.render(data);
        } catch (err) {
            console.error('Supabase admin detail error:', err);
        }
    }

    render(app) {
        this.currentApp = app;
        document.getElementById('appHeaderTitle').textContent = `Review: ${app.applicant_name}`;
        
        // Statuses
        const statusBadge = document.getElementById('appStatusBadge');
        statusBadge.textContent = app.application_status.replace('_', ' ');
        statusBadge.className = `badge status-${app.application_status}`;
        
        const payBadge = document.getElementById('payStatusBadge');
        payBadge.textContent = `Payment: ${app.payment_status}`;
        payBadge.className = `badge pay-${app.payment_status}`;

        // Payment Control
        if (app.payment_status === 'pending') {
            document.getElementById('paymentControl').classList.remove('hidden');
            document.getElementById('confirmPaymentBtn').onclick = () => this.updatePaymentStatus('paid');
        }

        // Status Update
        document.getElementById('statusSelect').value = app.application_status;
        document.getElementById('updateStatusBtn').onclick = () => this.updateAppStatus();

        // Data Rendering
        this.renderData(app.form_data);
    }

    renderData(formData) {
        const infoGrid = document.getElementById('applicantInfo');
        const mainFields = ['firstName', 'lastName', 'email', 'phone', 'dob', 'ssn'];
        infoGrid.innerHTML = mainFields.map(key => {
            let value = formData[key] || 'N/A';
            if (key === 'ssn' && value !== 'N/A') {
                value = '###-##-' + value.split('-').pop();
            }
            return `
                <div class="data-item">
                    <span class="data-label">${this.formatKey(key)}</span>
                    <span class="data-value">${value}</span>
                </div>
            `;
        }).join('');

        const fullGrid = document.getElementById('fullData');
        fullGrid.innerHTML = Object.keys(formData).map(key => {
            let value = formData[key] || 'N/A';
            if (key === 'ssn' && value !== 'N/A') {
                value = '###-##-' + value.split('-').pop();
            }
            return `
                <div class="data-item">
                    <span class="data-label">${this.formatKey(key)}</span>
                    <span class="data-value">${value}</span>
                </div>
            `;
        }).join('');
    }

    formatKey(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    showAccessRestricted() {
        document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Inter', sans-serif; background: #f1f5f9; color: #0f172a; text-align: center; padding: 20px;">
                <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; width: 100%;">
                    <i class="fas fa-lock" style="font-size: 3rem; color: #dc2626; margin-bottom: 20px; display: block;"></i>
                    <h1 style="font-size: 1.5rem; margin-bottom: 10px;">Access Restricted</h1>
                    <p style="color: #64748b; margin-bottom: 30px;">You do not have permission to access the administration area. Please contact the system administrator if you believe this is an error.</p>
                    <a href="../" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; transition: background 0.2s;">Return to Home</a>
                </div>
            </div>
        `;
    }

    async updatePaymentStatus(status) {
        if (!confirm('Confirm payment has been received?')) return;
        
        try {
            const adminEmail = session?.user?.email || 'admin@choiceproperties.com';
            const { error } = await this.supabase
                .from('rental_applications')
                .update({ 
                    payment_status: status,
                    application_status: status === 'paid' ? 'under_review' : 'awaiting_payment',
                    payment_marked_by: adminEmail,
                    payment_marked_at: new Date().toISOString()
                })
                .eq('application_id', this.appId);

            if (error) throw error;

            // Trigger Email notification via Edge Function
            await this.supabase.functions.invoke('clever-action', {
                body: { 
                    status: 'under_review',
                    application_id: this.appId,
                    applicant_email: this.currentApp?.applicant_email,
                    applicant_name: this.currentApp?.applicant_name
                }
            });

            window.location.reload();
        } catch (err) { 
            console.error('Update payment error:', err);
            alert('Payment updated, but email trigger may have failed.');
            window.location.reload();
        }
    }

    async updateAppStatus() {
        const status = document.getElementById('statusSelect').value;
        if (!confirm(`Change status to ${status.replace('_', ' ')}? An email will be sent to the applicant.`)) return;
        try {
            const { error } = await this.supabase
                .from('rental_applications')
                .update({ application_status: status })
                .eq('application_id', this.appId);

            if (error) throw error;

            // Trigger Email notification via Edge Function
            await this.supabase.functions.invoke('clever-action', {
                body: { 
                    application_id: this.appId,
                    applicant_email: this.currentApp?.applicant_email,
                    applicant_name: this.currentApp?.applicant_name,
                    status: status
                }
            });
            
            window.location.reload();
        } catch (err) { 
            console.error(err);
            alert('Status updated, but email notification failed.');
            window.location.reload();
        }
    }
}
