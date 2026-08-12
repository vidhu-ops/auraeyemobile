-- AuraEye Admin CRM — Phase 1 tables
-- Run against your Postgres (Replit / Neon) once before using /admin CRM features.

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id SERIAL PRIMARY KEY,
  actor_user_id INTEGER NOT NULL REFERENCES users(id),
  actor_username TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  previous_value TEXT,
  new_value TEXT,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_actor_idx ON admin_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_entity_idx ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_created_at_idx ON admin_audit_logs(created_at);

CREATE TABLE IF NOT EXISTS practitioner_contracts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  licence_status TEXT NOT NULL DEFAULT 'unknown',
  contract_status TEXT NOT NULL DEFAULT 'unsigned',
  start_date TEXT,
  end_date TEXT,
  renewal_date TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  channel TEXT DEFAULT 'crm',
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_user_idx ON support_tickets(user_id);

-- Staff logins for /admin (viewer / editor / support / owner)
CREATE TABLE IF NOT EXISTS crm_staff (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'viewer',
  display_name TEXT,
  can_view_users BOOLEAN DEFAULT TRUE,
  can_edit_users BOOLEAN DEFAULT FALSE,
  can_edit_credits BOOLEAN DEFAULT FALSE,
  can_view_revenue BOOLEAN DEFAULT TRUE,
  can_manage_healers BOOLEAN DEFAULT FALSE,
  can_manage_tickets BOOLEAN DEFAULT FALSE,
  can_manage_staff BOOLEAN DEFAULT FALSE,
  can_export_data BOOLEAN DEFAULT FALSE,
  can_erase_users BOOLEAN DEFAULT FALSE,
  can_view_audit BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS crm_staff_user_id_idx ON crm_staff(user_id);

-- Lead pipeline (prospective healers / partners)
CREATE TABLE IF NOT EXISTS crm_leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  mobile_number TEXT,
  source TEXT DEFAULT 'manual',
  stage TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  owner_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
