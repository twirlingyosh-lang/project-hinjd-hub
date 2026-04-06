
-- belt_diagnostics
DROP POLICY IF EXISTS "Auth delete own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Auth insert own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Auth update own diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Auth view own diagnostics" ON public.belt_diagnostics;
CREATE POLICY "Auth delete own diagnostics" ON public.belt_diagnostics FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own diagnostics" ON public.belt_diagnostics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own diagnostics" ON public.belt_diagnostics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own diagnostics" ON public.belt_diagnostics FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- code_snippets
DROP POLICY IF EXISTS "Auth delete own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Auth insert own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Auth update own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Auth view own snippets" ON public.code_snippets;
DROP POLICY IF EXISTS "Auth view public snippets" ON public.code_snippets;
CREATE POLICY "Auth delete own snippets" ON public.code_snippets FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own snippets" ON public.code_snippets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own snippets" ON public.code_snippets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth view own snippets" ON public.code_snippets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth view public snippets" ON public.code_snippets FOR SELECT TO authenticated USING (is_public = true);

-- crm_clients
DROP POLICY IF EXISTS "Auth delete own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Auth insert own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Auth update own clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Auth view own clients" ON public.crm_clients;
CREATE POLICY "Auth delete own clients" ON public.crm_clients FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own clients" ON public.crm_clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own clients" ON public.crm_clients FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own clients" ON public.crm_clients FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- crm_deals
DROP POLICY IF EXISTS "Auth delete own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Auth insert own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Auth update own deals" ON public.crm_deals;
DROP POLICY IF EXISTS "Auth view own deals" ON public.crm_deals;
CREATE POLICY "Auth delete own deals" ON public.crm_deals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own deals" ON public.crm_deals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own deals" ON public.crm_deals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own deals" ON public.crm_deals FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- crm_invoices
DROP POLICY IF EXISTS "Auth delete own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Auth insert own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Auth update own invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Auth view own invoices" ON public.crm_invoices;
CREATE POLICY "Auth delete own invoices" ON public.crm_invoices FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own invoices" ON public.crm_invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own invoices" ON public.crm_invoices FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own invoices" ON public.crm_invoices FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- crm_messages
DROP POLICY IF EXISTS "Auth delete own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Auth insert own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Auth update own messages" ON public.crm_messages;
DROP POLICY IF EXISTS "Auth view own messages" ON public.crm_messages;
CREATE POLICY "Auth delete own messages" ON public.crm_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own messages" ON public.crm_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own messages" ON public.crm_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own messages" ON public.crm_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- dealer_inventory
DROP POLICY IF EXISTS "Auth admins delete inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Auth admins insert inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Auth admins update inventory" ON public.dealer_inventory;
DROP POLICY IF EXISTS "Auth view inventory" ON public.dealer_inventory;
CREATE POLICY "Auth admins delete inventory" ON public.dealer_inventory FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins insert inventory" ON public.dealer_inventory FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update inventory" ON public.dealer_inventory FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth view inventory" ON public.dealer_inventory FOR SELECT TO authenticated USING (true);

-- diagnostic_logic
DROP POLICY IF EXISTS "Auth admins delete diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Auth admins insert diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Auth admins update diagnostic logic" ON public.diagnostic_logic;
DROP POLICY IF EXISTS "Module users view diagnostic logic" ON public.diagnostic_logic;
CREATE POLICY "Auth admins delete diagnostic logic" ON public.diagnostic_logic FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins insert diagnostic logic" ON public.diagnostic_logic FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update diagnostic logic" ON public.diagnostic_logic FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Module users view diagnostic logic" ON public.diagnostic_logic FOR SELECT TO authenticated USING (has_module_access('equipment_diagnostics'::text) OR has_role(auth.uid(), 'admin'::app_role));

-- email_leads (admin-only management, keep existing anon INSERT)
DROP POLICY IF EXISTS "Auth admins delete leads" ON public.email_leads;
DROP POLICY IF EXISTS "Auth admins update leads" ON public.email_leads;
DROP POLICY IF EXISTS "Auth admins view leads" ON public.email_leads;
CREATE POLICY "Auth admins delete leads" ON public.email_leads FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update leads" ON public.email_leads FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins view leads" ON public.email_leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- equipment_dealers
DROP POLICY IF EXISTS "Auth admins delete dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Auth admins insert dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Auth admins update dealers" ON public.equipment_dealers;
DROP POLICY IF EXISTS "Auth view dealers" ON public.equipment_dealers;
CREATE POLICY "Auth admins delete dealers" ON public.equipment_dealers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins insert dealers" ON public.equipment_dealers FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update dealers" ON public.equipment_dealers FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth view dealers" ON public.equipment_dealers FOR SELECT TO authenticated USING (true);

-- equipment_diagnostics
DROP POLICY IF EXISTS "Auth delete own equip diag" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Auth insert own equip diag" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Auth update own equip diag" ON public.equipment_diagnostics;
DROP POLICY IF EXISTS "Auth view own equip diag" ON public.equipment_diagnostics;
CREATE POLICY "Auth delete own equip diag" ON public.equipment_diagnostics FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own equip diag" ON public.equipment_diagnostics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own equip diag" ON public.equipment_diagnostics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own equip diag" ON public.equipment_diagnostics FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- equipment_master
DROP POLICY IF EXISTS "Auth admins delete equipment master" ON public.equipment_master;
DROP POLICY IF EXISTS "Auth admins insert equipment master" ON public.equipment_master;
DROP POLICY IF EXISTS "Auth admins update equipment master" ON public.equipment_master;
DROP POLICY IF EXISTS "Auth view equipment master" ON public.equipment_master;
CREATE POLICY "Auth admins delete equipment master" ON public.equipment_master FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins insert equipment master" ON public.equipment_master FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update equipment master" ON public.equipment_master FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth view equipment master" ON public.equipment_master FOR SELECT TO authenticated USING (true);

-- equipment_parts
DROP POLICY IF EXISTS "Auth admins delete parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Auth admins insert parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Auth admins update parts" ON public.equipment_parts;
DROP POLICY IF EXISTS "Auth view parts" ON public.equipment_parts;
CREATE POLICY "Auth admins delete parts" ON public.equipment_parts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins insert parts" ON public.equipment_parts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update parts" ON public.equipment_parts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth view parts" ON public.equipment_parts FOR SELECT TO authenticated USING (true);

-- fleet_units
DROP POLICY IF EXISTS "Auth admins delete fleet" ON public.fleet_units;
DROP POLICY IF EXISTS "Auth admins insert fleet" ON public.fleet_units;
DROP POLICY IF EXISTS "Auth admins update fleet" ON public.fleet_units;
DROP POLICY IF EXISTS "Auth admins view fleet" ON public.fleet_units;
DROP POLICY IF EXISTS "Auth delete own fleet" ON public.fleet_units;
DROP POLICY IF EXISTS "Auth insert own fleet" ON public.fleet_units;
DROP POLICY IF EXISTS "Auth update own fleet" ON public.fleet_units;
DROP POLICY IF EXISTS "Auth view own fleet" ON public.fleet_units;
CREATE POLICY "Auth admins delete fleet" ON public.fleet_units FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins insert fleet" ON public.fleet_units FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update fleet" ON public.fleet_units FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins view fleet" ON public.fleet_units FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth delete own fleet" ON public.fleet_units FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own fleet" ON public.fleet_units FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own fleet" ON public.fleet_units FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own fleet" ON public.fleet_units FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- hq_transactions
DROP POLICY IF EXISTS "Auth admins create txns" ON public.hq_transactions;
DROP POLICY IF EXISTS "Auth admins delete txns" ON public.hq_transactions;
DROP POLICY IF EXISTS "Auth admins update txns" ON public.hq_transactions;
DROP POLICY IF EXISTS "Auth admins view all txns" ON public.hq_transactions;
DROP POLICY IF EXISTS "Auth view own txns" ON public.hq_transactions;
CREATE POLICY "Auth admins create txns" ON public.hq_transactions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete txns" ON public.hq_transactions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update txns" ON public.hq_transactions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins view all txns" ON public.hq_transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth view own txns" ON public.hq_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- order_manifests
DROP POLICY IF EXISTS "Auth admins delete manifests" ON public.order_manifests;
DROP POLICY IF EXISTS "Auth admins insert manifests" ON public.order_manifests;
DROP POLICY IF EXISTS "Auth admins update manifests" ON public.order_manifests;
DROP POLICY IF EXISTS "Auth admins view all manifests" ON public.order_manifests;
DROP POLICY IF EXISTS "Auth view own manifests" ON public.order_manifests;
CREATE POLICY "Auth admins delete manifests" ON public.order_manifests FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins insert manifests" ON public.order_manifests FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update manifests" ON public.order_manifests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins view all manifests" ON public.order_manifests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth view own manifests" ON public.order_manifests FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- orders
DROP POLICY IF EXISTS "Auth admins insert orders" ON public.orders;
DROP POLICY IF EXISTS "Auth admins view all orders" ON public.orders;
DROP POLICY IF EXISTS "Auth insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Auth view own orders" ON public.orders;
CREATE POLICY "Auth admins insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins view all orders" ON public.orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Auth admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Auth delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Auth insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Auth update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Auth view own profile" ON public.profiles;
CREATE POLICY "Auth admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Auth insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Auth update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Auth view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- referrals
DROP POLICY IF EXISTS "Auth admins view all referrals" ON public.referrals;
DROP POLICY IF EXISTS "Auth create own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Auth update own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Auth view own referrals" ON public.referrals;
CREATE POLICY "Auth admins view all referrals" ON public.referrals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth create own referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "Auth update own referrals" ON public.referrals FOR UPDATE TO authenticated USING (auth.uid() = referrer_id);
CREATE POLICY "Auth view own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);

-- repair_logs
DROP POLICY IF EXISTS "Auth delete own repairs" ON public.repair_logs;
DROP POLICY IF EXISTS "Auth insert own repairs" ON public.repair_logs;
DROP POLICY IF EXISTS "Auth update own repairs" ON public.repair_logs;
DROP POLICY IF EXISTS "Auth view own repairs" ON public.repair_logs;
CREATE POLICY "Auth delete own repairs" ON public.repair_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own repairs" ON public.repair_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own repairs" ON public.repair_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own repairs" ON public.repair_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- subscriptions
DROP POLICY IF EXISTS "Auth delete own sub" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth insert own sub" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth update own sub" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth view own sub" ON public.subscriptions;
CREATE POLICY "Auth delete own sub" ON public.subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own sub" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own sub" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own sub" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- throughput_logs
DROP POLICY IF EXISTS "Auth delete own throughput" ON public.throughput_logs;
DROP POLICY IF EXISTS "Auth insert own throughput" ON public.throughput_logs;
DROP POLICY IF EXISTS "Auth update own throughput" ON public.throughput_logs;
DROP POLICY IF EXISTS "Auth view own throughput" ON public.throughput_logs;
CREATE POLICY "Auth delete own throughput" ON public.throughput_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert own throughput" ON public.throughput_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own throughput" ON public.throughput_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own throughput" ON public.throughput_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- transactions
DROP POLICY IF EXISTS "Auth admins insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Auth admins view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Auth insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Auth view own transactions" ON public.transactions;
CREATE POLICY "Auth admins insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins view all transactions" ON public.transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- treasury_activity
DROP POLICY IF EXISTS "Auth admins insert treasury" ON public.treasury_activity;
DROP POLICY IF EXISTS "Auth admins view treasury" ON public.treasury_activity;
DROP POLICY IF EXISTS "Auth insert own treasury" ON public.treasury_activity;
DROP POLICY IF EXISTS "Auth view own treasury" ON public.treasury_activity;
CREATE POLICY "Auth admins insert treasury" ON public.treasury_activity FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins view treasury" ON public.treasury_activity FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth insert own treasury" ON public.treasury_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own treasury" ON public.treasury_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- treasury_metrics
DROP POLICY IF EXISTS "Auth admins delete metrics" ON public.treasury_metrics;
DROP POLICY IF EXISTS "Auth admins update metrics" ON public.treasury_metrics;
DROP POLICY IF EXISTS "Auth admins view metrics" ON public.treasury_metrics;
DROP POLICY IF EXISTS "Auth insert own metrics" ON public.treasury_metrics;
DROP POLICY IF EXISTS "Auth update own metrics" ON public.treasury_metrics;
DROP POLICY IF EXISTS "Auth view own metrics" ON public.treasury_metrics;
CREATE POLICY "Auth admins delete metrics" ON public.treasury_metrics FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update metrics" ON public.treasury_metrics FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins view metrics" ON public.treasury_metrics FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth insert own metrics" ON public.treasury_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update own metrics" ON public.treasury_metrics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth view own metrics" ON public.treasury_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_modules
DROP POLICY IF EXISTS "Auth admins delete modules" ON public.user_modules;
DROP POLICY IF EXISTS "Auth admins insert modules" ON public.user_modules;
DROP POLICY IF EXISTS "Auth admins update modules" ON public.user_modules;
DROP POLICY IF EXISTS "Auth view own modules" ON public.user_modules;
CREATE POLICY "Auth admins delete modules" ON public.user_modules FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins insert modules" ON public.user_modules FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update modules" ON public.user_modules FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth view own modules" ON public.user_modules FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Auth admins assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Auth admins delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Auth admins update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Auth view own roles" ON public.user_roles;
CREATE POLICY "Auth admins assign roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth admins update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- workflow_runs
DROP POLICY IF EXISTS "Auth create own workflows" ON public.workflow_runs;
DROP POLICY IF EXISTS "Auth delete own workflows" ON public.workflow_runs;
DROP POLICY IF EXISTS "Auth update own workflows" ON public.workflow_runs;
DROP POLICY IF EXISTS "Auth view own workflows" ON public.workflow_runs;
CREATE POLICY "Auth create own workflows" ON public.workflow_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own workflows" ON public.workflow_runs FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth update own workflows" ON public.workflow_runs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth view own workflows" ON public.workflow_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- workflow_steps
DROP POLICY IF EXISTS "Auth create own steps" ON public.workflow_steps;
DROP POLICY IF EXISTS "Auth delete own steps" ON public.workflow_steps;
DROP POLICY IF EXISTS "Auth update own steps" ON public.workflow_steps;
DROP POLICY IF EXISTS "Auth view own steps" ON public.workflow_steps;
CREATE POLICY "Auth create own steps" ON public.workflow_steps FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));
CREATE POLICY "Auth delete own steps" ON public.workflow_steps FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));
CREATE POLICY "Auth update own steps" ON public.workflow_steps FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));
CREATE POLICY "Auth view own steps" ON public.workflow_steps FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM workflow_runs WHERE workflow_runs.id = workflow_steps.workflow_run_id AND workflow_runs.user_id = auth.uid()));

-- STORAGE FIXES
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
CREATE POLICY "Auth view own manifests storage" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'manifests' AND (auth.uid())::text = (storage.foldername(name))[1]);
