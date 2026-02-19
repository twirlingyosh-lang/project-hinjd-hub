
-- ============================================================
-- FIX: Restrict ALL RLS policies to 'authenticated' role only
-- This prevents anonymous users from accessing any data
-- ============================================================

-- ==================== belt_diagnostics ====================
DROP POLICY IF EXISTS "Authenticated users can delete own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can insert own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can update own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can view own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Users can insert diagnostics" ON public.belt_diagnostics;

CREATE POLICY "Authenticated users can delete own diagnostics" ON public.belt_diagnostics FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert own diagnostics" ON public.belt_diagnostics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update own diagnostics" ON public.belt_diagnostics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view own diagnostics" ON public.belt_diagnostics FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== code_snippets ====================
DROP POLICY IF EXISTS "Users can view own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Users can view public snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Users can insert own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Users can update own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Users can delete own snippets" ON public.code_snippets;

CREATE POLICY "Users can view own snippets" ON public.code_snippets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view public snippets" ON public.code_snippets FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can insert own snippets" ON public.code_snippets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snippets" ON public.code_snippets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own snippets" ON public.code_snippets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ==================== crm_clients ====================
DROP POLICY IF EXISTS "Users can delete own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Users can view own clients" ON public.crm_clients;

CREATE POLICY "Users can delete own clients" ON public.crm_clients FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON public.crm_clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.crm_clients FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own clients" ON public.crm_clients FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== crm_deals ====================
DROP POLICY IF EXISTS "Users can delete own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Users can insert own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Users can update own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Users can view own deals" ON public.crm_deals;

CREATE POLICY "Users can delete own deals" ON public.crm_deals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deals" ON public.crm_deals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deals" ON public.crm_deals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own deals" ON public.crm_deals FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== crm_invoices ====================
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.crm_invoices;

CREATE POLICY "Users can delete own invoices" ON public.crm_invoices FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON public.crm_invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON public.crm_invoices FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own invoices" ON public.crm_invoices FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== crm_messages ====================
DROP POLICY IF EXISTS "Users can delete own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.crm_messages;

CREATE POLICY "Users can delete own messages" ON public.crm_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.crm_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.crm_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own messages" ON public.crm_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== dealer_inventory ====================
DROP POLICY IF EXISTS "Admins can delete dealer inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Admins can insert dealer inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Admins can update dealer inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Auth users can view dealer inventory" ON public.dealer_inventory;

CREATE POLICY "Admins can delete dealer inventory" ON public.dealer_inventory FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert dealer inventory" ON public.dealer_inventory FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update dealer inventory" ON public.dealer_inventory FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth users can view dealer inventory" ON public.dealer_inventory FOR SELECT TO authenticated USING (true);

-- ==================== diagnostic_logic ====================
DROP POLICY IF EXISTS "Admins can delete diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Admins can insert diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Admins can update diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Auth users can view diagnostic logic" ON public.diagnostic_logic;

CREATE POLICY "Admins can delete diagnostic logic" ON public.diagnostic_logic FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert diagnostic logic" ON public.diagnostic_logic FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update diagnostic logic" ON public.diagnostic_logic FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth users can view diagnostic logic" ON public.diagnostic_logic FOR SELECT TO authenticated USING (true);

-- ==================== email_leads ====================
DROP POLICY IF EXISTS "Admins can view leads" ON public.email_leads;
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.email_leads;
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.email_leads;
DROP POLICY IF EXISTS "Only admins can update leads" ON public.email_leads;

CREATE POLICY "Admins can view leads" ON public.email_leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can submit a lead" ON public.email_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Only admins can delete leads" ON public.email_leads FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update leads" ON public.email_leads FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ==================== equipment_dealers ====================
DROP POLICY IF EXISTS "Admins can delete dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Admins can insert dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Admins can update dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Auth users can view dealers" ON public.equipment_dealers;

CREATE POLICY "Admins can delete dealers" ON public.equipment_dealers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert dealers" ON public.equipment_dealers FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update dealers" ON public.equipment_dealers FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth users can view dealers" ON public.equipment_dealers FOR SELECT TO authenticated USING (true);

-- ==================== equipment_diagnostics ====================
DROP POLICY IF EXISTS "Authenticated users can delete own equipment diagnostics" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can insert own equipment diagnostics" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can update own equipment diagnostics" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Authenticated users can view own equipment diagnostics" ON public.equipment_diagnostics;

CREATE POLICY "Authenticated users can delete own equipment diagnostics" ON public.equipment_diagnostics FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert own equipment diagnostics" ON public.equipment_diagnostics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update own equipment diagnostics" ON public.equipment_diagnostics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view own equipment diagnostics" ON public.equipment_diagnostics FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== equipment_parts ====================
DROP POLICY IF EXISTS "Admins can delete parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Admins can insert parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Admins can update parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Auth users can view parts" ON public.equipment_parts;

CREATE POLICY "Admins can delete parts" ON public.equipment_parts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert parts" ON public.equipment_parts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update parts" ON public.equipment_parts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth users can view parts" ON public.equipment_parts FOR SELECT TO authenticated USING (true);

-- ==================== fleet_units ====================
DROP POLICY IF EXISTS "Admins can delete all fleet units" ON public.fleet_units;
DROP POLICY IF EXISTS "Admins can insert fleet units for any user" ON public.fleet_units;
DROP POLICY IF EXISTS "Admins can update all fleet units" ON public.fleet_units;
DROP POLICY IF EXISTS "Admins can view all fleet units" ON public.fleet_units;
DROP POLICY IF EXISTS "Users can delete own fleet units" ON public.fleet_units;
DROP POLICY IF EXISTS "Users can insert own fleet units" ON public.fleet_units;
DROP POLICY IF EXISTS "Users can update own fleet units" ON public.fleet_units;
DROP POLICY IF EXISTS "Users can view own fleet units" ON public.fleet_units;

CREATE POLICY "Admins can delete all fleet units" ON public.fleet_units FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert fleet units for any user" ON public.fleet_units FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all fleet units" ON public.fleet_units FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all fleet units" ON public.fleet_units FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can delete own fleet units" ON public.fleet_units FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fleet units" ON public.fleet_units FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fleet units" ON public.fleet_units FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own fleet units" ON public.fleet_units FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== hq_transactions ====================
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.hq_transactions;
DROP POLICY IF EXISTS "Deny anonymous access to hq_transactions" ON public.hq_transactions;
DROP POLICY IF EXISTS "Only admins can create transactions" ON public.hq_transactions;
DROP POLICY IF EXISTS "Only admins can delete transactions" ON public.hq_transactions;
DROP POLICY IF EXISTS "Only admins can update transactions" ON public.hq_transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.hq_transactions;

CREATE POLICY "Admins can view all transactions" ON public.hq_transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can create transactions" ON public.hq_transactions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete transactions" ON public.hq_transactions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update transactions" ON public.hq_transactions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own transactions" ON public.hq_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== profiles ====================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Authenticated users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Authenticated users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Authenticated users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- ==================== subscriptions ====================
DROP POLICY IF EXISTS "Auth users can delete own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Authenticated users can insert their own subscription" ON public.subscriptions;

CREATE POLICY "Auth users can delete own subscription" ON public.subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth users can insert own subscription" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can update own subscription" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== treasury_activity ====================
DROP POLICY IF EXISTS "Admins can insert treasury activity for any user" ON public.treasury_activity;
DROP POLICY IF EXISTS "Admins can view all treasury activity" ON public.treasury_activity;
DROP POLICY IF EXISTS "Users can insert own treasury activity" ON public.treasury_activity;
DROP POLICY IF EXISTS "Users can view own treasury activity" ON public.treasury_activity;

CREATE POLICY "Admins can insert treasury activity for any user" ON public.treasury_activity FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all treasury activity" ON public.treasury_activity FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own treasury activity" ON public.treasury_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own treasury activity" ON public.treasury_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== treasury_metrics ====================
DROP POLICY IF EXISTS "Admins can delete all treasury metrics" ON public.treasury_metrics;
DROP POLICY IF EXISTS "Admins can update all treasury metrics" ON public.treasury_metrics;
DROP POLICY IF EXISTS "Admins can view all treasury metrics" ON public.treasury_metrics;
DROP POLICY IF EXISTS "Users can insert own treasury metrics" ON public.treasury_metrics;
DROP POLICY IF EXISTS "Users can update own treasury metrics" ON public.treasury_metrics;
DROP POLICY IF EXISTS "Users can view own treasury metrics" ON public.treasury_metrics;

CREATE POLICY "Admins can delete all treasury metrics" ON public.treasury_metrics FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all treasury metrics" ON public.treasury_metrics FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all treasury metrics" ON public.treasury_metrics FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own treasury metrics" ON public.treasury_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own treasury metrics" ON public.treasury_metrics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own treasury metrics" ON public.treasury_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== user_modules ====================
DROP POLICY IF EXISTS "Auth users can view own modules" ON public.user_modules;
DROP POLICY IF EXISTS "Only admins can activate modules" ON public.user_modules;
DROP POLICY IF EXISTS "Only admins can deactivate modules" ON public.user_modules;
DROP POLICY IF EXISTS "Only admins can update modules" ON public.user_modules;

CREATE POLICY "Auth users can view own modules" ON public.user_modules FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Only admins can activate modules" ON public.user_modules FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can deactivate modules" ON public.user_modules FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update modules" ON public.user_modules FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ==================== user_roles ====================
DROP POLICY IF EXISTS "Only admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Only admins can assign roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== workflow_runs ====================
DROP POLICY IF EXISTS "Users can create their own workflow runs" ON public.workflow_runs;
DROP POLICY IF EXISTS "Users can delete their own workflow runs" ON public.workflow_runs;
DROP POLICY IF EXISTS "Users can update their own workflow runs" ON public.workflow_runs;
DROP POLICY IF EXISTS "Users can view their own workflow runs" ON public.workflow_runs;

CREATE POLICY "Users can create their own workflow runs" ON public.workflow_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workflow runs" ON public.workflow_runs FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own workflow runs" ON public.workflow_runs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own workflow runs" ON public.workflow_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== workflow_steps ====================
DROP POLICY IF EXISTS "Users can create steps in their own workflows" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can delete steps in their own workflows" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can update steps in their own workflows" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can view steps of their own workflows" ON public.workflow_steps;

CREATE POLICY "Users can create steps in their own workflows" ON public.workflow_steps FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));
CREATE POLICY "Users can delete steps in their own workflows" ON public.workflow_steps FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));
CREATE POLICY "Users can update steps in their own workflows" ON public.workflow_steps FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));
CREATE POLICY "Users can view steps of their own workflows" ON public.workflow_steps FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));

-- ==================== storage.objects ====================
-- Fix storage policies to restrict to authenticated role

-- Drop all existing storage policies and recreate with TO authenticated
DROP POLICY IF EXISTS "Authenticated users can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own invoice PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own client profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own invoice PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own invoice PDFs" ON storage.objects;

-- assets bucket (public read for authenticated)
CREATE POLICY "Auth users can view assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'assets');
CREATE POLICY "Auth users can upload assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can update assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can delete assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- avatars bucket
CREATE POLICY "Auth users can view avatars" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Auth users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- documents bucket
CREATE POLICY "Auth users can view own documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can update documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- equipment-images bucket
CREATE POLICY "Auth users can view equipment images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'equipment-images');
CREATE POLICY "Auth users can upload equipment images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'equipment-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can delete equipment images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'equipment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- crm-contracts bucket
CREATE POLICY "Auth users can view own contracts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'crm-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can upload contracts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'crm-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can delete contracts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'crm-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- crm-invoices bucket
CREATE POLICY "Auth users can view own invoices" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'crm-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can upload invoices" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'crm-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can delete invoices" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'crm-invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- crm-profiles bucket
CREATE POLICY "Auth users can view own crm profiles" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can upload crm profiles" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can update crm profiles" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth users can delete crm profiles" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'crm-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
