
-- This file is for reference only and represents the expected database schema

-- Profiles table to store user profile information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Business profiles table
CREATE TABLE public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website_template TEXT,
  about_text TEXT,
  vision_text TEXT,
  mission_text TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Business team members table
CREATE TABLE public.business_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id, user_id)
);

-- Compliance documents table
CREATE TABLE public.compliance_documents (
  business_id UUID REFERENCES public.business_profiles NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  required BOOLEAN NOT NULL DEFAULT true,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  file_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (business_id, id)
);

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  value NUMERIC,
  notes TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles NOT NULL,
  customer_id UUID REFERENCES public.customers,
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles NOT NULL,
  customer_id UUID REFERENCES public.customers,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  subtotal NUMERIC NOT NULL,
  vat NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security Policies

-- Profiles: Users can only read their own profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Business Profiles: Users can only read/edit their own business or ones they're a member of
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own business" ON public.business_profiles
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM public.business_team_members
      WHERE business_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own business" ON public.business_profiles
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own business" ON public.business_profiles
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Team Members: Business owners can manage members
ALTER TABLE public.business_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage team" ON public.business_team_members
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Members can view team" ON public.business_team_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- Compliance Documents: Business owners can manage documents
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can view their own documents" ON public.compliance_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Businesses can insert their own documents" ON public.compliance_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Businesses can update their own documents" ON public.compliance_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- Leads: Business owners and team members can manage leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business team can manage leads" ON public.leads
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE id = business_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.business_team_members
      WHERE business_id = business_id AND user_id = auth.uid()
    )
  );

-- Customers: Business owners and team members can manage customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business team can manage customers" ON public.customers
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE id = business_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.business_team_members
      WHERE business_id = business_id AND user_id = auth.uid()
    )
  );

-- Sales: Business owners and team members can manage sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business team can manage sales" ON public.sales
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE id = business_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.business_team_members
      WHERE business_id = business_id AND user_id = auth.uid()
    )
  );

-- Quotes: Business owners and team members can manage quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business team can manage quotes" ON public.quotes
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE id = business_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.business_team_members
      WHERE business_id = business_id AND user_id = auth.uid()
    )
  );
