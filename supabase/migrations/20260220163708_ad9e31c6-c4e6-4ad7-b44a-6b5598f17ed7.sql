
-- ============================================================
-- DROP all legacy policies that lack TO authenticated / TO anon
-- and recreate ONLY the current correct ones with explicit roles
-- ============================================================

-- BELT_DIAGNOSTICS: drop old unnamed-style policies
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'belt_diagnostics' AND schemaname = 'public'
    AND policyname NOT IN ('Auth users can delete own diagnostics','Auth users can insert own diagnostics','Auth users can update own diagnostics','Auth users can view own diagnostics')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.belt_diagnostics', pol.policyname);
  END LOOP;
END $$;

-- Drop and recreate belt_diagnostics policies with TO authenticated
DROP POLICY IF EXISTS "Auth users can delete own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Auth users can insert own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Auth users can update own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Auth users can view own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can delete own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can update own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can view own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can insert own diagnostics" ON public.belt_diagnostics;

CREATE POLICY "Auth view own diagnostics" ON public.belt_diagnostics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own diagnostics" ON public.belt_diagnostics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own diagnostics" ON public.belt_diagnostics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own diagnostics" ON public.belt_diagnostics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CODE_SNIPPETS
DROP POLICY IF EXISTS "Auth delete own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Auth insert own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Auth update own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Auth view own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Auth view public snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Users can delete own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Users can update own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Users can view own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Users can view public snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Users can insert own snippets" ON public.code_snippets;

CREATE POLICY "Auth view own snippets" ON public.code_snippets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth view public snippets" ON public.code_snippets FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Auth insert own snippets" ON public.code_snippets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own snippets" ON public.code_snippets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth delete own snippets" ON public.code_snippets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CRM_CLIENTS
DROP POLICY IF EXISTS "Auth delete own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Auth insert own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Auth update own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Auth view own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Users can view own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON public.crm_clients;

CREATE POLICY "Auth view own clients" ON public.crm_clients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own clients" ON public.crm_clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own clients" ON public.crm_clients FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own clients" ON public.crm_clients FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CRM_DEALS
DROP POLICY IF EXISTS "Auth delete own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Auth insert own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Auth update own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Auth view own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Users can delete own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Users can update own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Users can view own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Users can insert own deals" ON public.crm_deals;

CREATE POLICY "Auth view own deals" ON public.crm_deals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own deals" ON public.crm_deals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own deals" ON public.crm_deals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own deals" ON public.crm_deals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CRM_INVOICES
DROP POLICY IF EXISTS "Auth delete own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Auth insert own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Auth update own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Auth view own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.crm_invoices;

CREATE POLICY "Auth view own invoices" ON public.crm_invoices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own invoices" ON public.crm_invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own invoices" ON public.crm_invoices FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own invoices" ON public.crm_invoices FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CRM_MESSAGES
DROP POLICY IF EXISTS "Auth delete own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Auth insert own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Auth update own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Auth view own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.crm_messages;

CREATE POLICY "Auth view own messages" ON public.crm_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own messages" ON public.crm_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own messages" ON public.crm_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own messages" ON public.crm_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- DEALER_INVENTORY
DROP POLICY IF EXISTS "Auth admins delete inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Auth admins insert inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Auth admins update inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Auth users view inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Admins can delete dealer inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Admins can update dealer inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Auth users can view dealer inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Admins can insert dealer inventory" ON public.dealer_inventory;

CREATE POLICY "Auth view inventory" ON public.dealer_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth admins insert inventory" ON public.dealer_inventory FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update inventory" ON public.dealer_inventory FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete inventory" ON public.dealer_inventory FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- DIAGNOSTIC_LOGIC
DROP POLICY IF EXISTS "Auth admins delete diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Auth admins insert diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Auth admins update diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Auth users view diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Admins can delete diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Admins can update diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Auth users can view diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Admins can insert diagnostic logic" ON public.diagnostic_logic;

CREATE POLICY "Auth view diagnostic logic" ON public.diagnostic_logic FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth admins insert diagnostic logic" ON public.diagnostic_logic FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update diagnostic logic" ON public.diagnostic_logic FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete diagnostic logic" ON public.diagnostic_logic FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- EMAIL_LEADS
DROP POLICY IF EXISTS "Anon can submit lead" ON public.email_leads;
DROP POLICY IF EXISTS "Auth admins delete leads" ON public.email_leads;
DROP POLICY IF EXISTS "Auth admins update leads" ON public.email_leads;
DROP POLICY IF EXISTS "Auth admins view leads" ON public.email_leads;
DROP POLICY IF EXISTS "Admins can view leads" ON public.email_leads;
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.email_leads;
DROP POLICY IF EXISTS "Only admins can update leads" ON public.email_leads;
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.email_leads;

CREATE POLICY "Anon submit lead" ON public.email_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Auth admins view leads" ON public.email_leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update leads" ON public.email_leads FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete leads" ON public.email_leads FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- EQUIPMENT_DEALERS
DROP POLICY IF EXISTS "Auth admins delete dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Auth admins insert dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Auth admins update dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Auth users view dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Admins can delete dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Admins can update dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Auth users can view dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Admins can insert dealers" ON public.equipment_dealers;

CREATE POLICY "Auth view dealers" ON public.equipment_dealers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth admins insert dealers" ON public.equipment_dealers FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update dealers" ON public.equipment_dealers FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete dealers" ON public.equipment_dealers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- EQUIPMENT_DIAGNOSTICS
DROP POLICY IF EXISTS "Auth delete own equip diag" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Auth insert own equip diag" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Auth update own equip diag" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Auth view own equip diag" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can delete own equipment diagnostics" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can update own equipment diagnostics" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can view own equipment diagnostics" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can insert own equipment diagnostics" ON public.equipment_diagnostics;

CREATE POLICY "Auth view own equip diag" ON public.equipment_diagnostics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own equip diag" ON public.equipment_diagnostics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own equip diag" ON public.equipment_diagnostics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own equip diag" ON public.equipment_diagnostics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- EQUIPMENT_PARTS
DROP POLICY IF EXISTS "Auth admins delete parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Auth admins insert parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Auth admins update parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Auth users view parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Admins can delete parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Admins can update parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Auth users can view parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Admins can insert parts" ON public.equipment_parts;

CREATE POLICY "Auth view parts" ON public.equipment_parts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth admins insert parts" ON public.equipment_parts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update parts" ON public.equipment_parts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete parts" ON public.equipment_parts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- FLEET_UNITS
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'fleet_units' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.fleet_units', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Auth view own fleet" ON public.fleet_units FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth admins view fleet" ON public.fleet_units FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth insert own fleet" ON public.fleet_units FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth admins insert fleet" ON public.fleet_units FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth update own fleet" ON public.fleet_units FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth admins update fleet" ON public.fleet_units FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth delete own fleet" ON public.fleet_units FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth admins delete fleet" ON public.fleet_units FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- HQ_TRANSACTIONS
DROP POLICY IF EXISTS "Auth admins create txns" ON public.hq_transactions;
DROP POLICY IF EXISTS "Auth admins delete txns" ON public.hq_transactions;
DROP POLICY IF EXISTS "Auth admins update txns" ON public.hq_transactions;
DROP POLICY IF EXISTS "Auth admins view all txns" ON public.hq_transactions;
DROP POLICY IF EXISTS "Auth view own txns" ON public.hq_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.hq_transactions;
DROP POLICY IF EXISTS "Only admins can delete transactions" ON public.hq_transactions;
DROP POLICY IF EXISTS "Only admins can update transactions" ON public.hq_transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.hq_transactions;
DROP POLICY IF EXISTS "Only admins can insert transactions" ON public.hq_transactions;

CREATE POLICY "Auth view own txns" ON public.hq_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth admins view all txns" ON public.hq_transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins create txns" ON public.hq_transactions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update txns" ON public.hq_transactions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete txns" ON public.hq_transactions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- PROFILES
DROP POLICY IF EXISTS "Auth admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Auth delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Auth insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Auth update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Auth view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;

CREATE POLICY "Auth view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Auth admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Auth update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Auth delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- REFERRALS
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'referrals' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.referrals', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Auth view own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);
CREATE POLICY "Auth admins view all referrals" ON public.referrals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth create own referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "Auth update own referrals" ON public.referrals FOR UPDATE TO authenticated USING (auth.uid() = referrer_id);

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Auth delete own sub" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth insert own sub" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth update own sub" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth view own sub" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth users can delete own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth users can insert own subscription" ON public.subscriptions;

CREATE POLICY "Auth view own sub" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own sub" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own sub" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own sub" ON public.subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- TREASURY_ACTIVITY
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'treasury_activity' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.treasury_activity', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Auth view own treasury" ON public.treasury_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth admins view treasury" ON public.treasury_activity FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth insert own treasury" ON public.treasury_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth admins insert treasury" ON public.treasury_activity FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- TREASURY_METRICS
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'treasury_metrics' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.treasury_metrics', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Auth view own metrics" ON public.treasury_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth admins view metrics" ON public.treasury_metrics FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth insert own metrics" ON public.treasury_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own metrics" ON public.treasury_metrics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth admins update metrics" ON public.treasury_metrics FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete metrics" ON public.treasury_metrics FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- USER_MODULES
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'user_modules' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_modules', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Auth view own modules" ON public.user_modules FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth admins insert modules" ON public.user_modules FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update modules" ON public.user_modules FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete modules" ON public.user_modules FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- USER_ROLES
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Auth view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth admins assign roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- WORKFLOW_RUNS
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'workflow_runs' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.workflow_runs', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Auth view own workflows" ON public.workflow_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth create own workflows" ON public.workflow_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own workflows" ON public.workflow_runs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth delete own workflows" ON public.workflow_runs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- WORKFLOW_STEPS
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'workflow_steps' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.workflow_steps', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Auth view own steps" ON public.workflow_steps FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));
CREATE POLICY "Auth create own steps" ON public.workflow_steps FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));
CREATE POLICY "Auth update own steps" ON public.workflow_steps FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));
CREATE POLICY "Auth delete own steps" ON public.workflow_steps FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));

-- STORAGE: Drop ALL old policies on storage.objects and recreate with TO authenticated
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Assets bucket (public read for authenticated, admin write)
CREATE POLICY "Auth view assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'assets');
CREATE POLICY "Auth insert assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth update assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth delete assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars bucket
CREATE POLICY "Auth view avatars" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Auth insert avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Documents bucket
CREATE POLICY "Auth view documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth insert documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth update documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Equipment images bucket
CREATE POLICY "Auth view equip images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'equipment-images');
CREATE POLICY "Auth insert equip images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'equipment-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth update equip images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'equipment-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth delete equip images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'equipment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CRM contracts bucket
CREATE POLICY "Auth view contracts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'crm-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth insert contracts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'crm-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth update contracts" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'crm-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth delete contracts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'crm-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CRM invoices bucket
CREATE POLICY "Auth view invoices storage" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'crm-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth insert invoices storage" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'crm-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth update invoices storage" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'crm-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth delete invoices storage" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'crm-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CRM profiles bucket
CREATE POLICY "Auth view crm profiles" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth insert crm profiles" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth update crm profiles" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth delete crm profiles" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
