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
  category TEXT DEFAULT 'general',
  requester_name TEXT,
  requester_email TEXT,
  metadata TEXT,
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_user_idx ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_channel_idx ON support_tickets(channel);

-- Upgrade existing support_tickets tables
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS requester_name TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS requester_email TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS metadata TEXT;

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

-- Credit grants with optional expiry (remaining consumed FIFO; expired remaining deducted)
CREATE TABLE IF NOT EXISTS credit_grants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  remaining INTEGER NOT NULL,
  expires_at TIMESTAMP,
  source TEXT NOT NULL DEFAULT 'manual',
  note TEXT,
  created_by_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expired_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS credit_grants_user_id_idx ON credit_grants(user_id);
CREATE INDEX IF NOT EXISTS credit_grants_expires_at_idx ON credit_grants(expires_at);

-- Website page views (admin analytics)
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  user_id INTEGER REFERENCES users(id),
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views(path);
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views(created_at);
CREATE INDEX IF NOT EXISTS page_views_session_id_idx ON page_views(session_id);
