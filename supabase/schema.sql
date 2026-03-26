-- ============================================
-- LOUVI — Schéma complet de base de données
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- Supprimer les tables existantes si besoin (décommenter pour reset)
-- DROP TABLE IF EXISTS public.testimonials CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- ============================================
-- TABLE: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  website TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  collect_link_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: testimonials
-- ============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_company TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEX
-- ============================================
CREATE INDEX IF NOT EXISTS idx_testimonials_owner_id ON public.testimonials(owner_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_profiles_collect_link_id ON public.profiles(collect_link_id);

-- ============================================
-- FONCTION: Générer un collect_link_id unique (8 caractères)
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_collect_link_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Créer automatiquement un profil à l'inscription
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, company_name, collect_link_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    public.generate_collect_link_id()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur profil" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur profil" ON public.profiles;
DROP POLICY IF EXISTS "Lecture publique des profils par collect_link_id" ON public.profiles;
DROP POLICY IF EXISTS "Les propriétaires peuvent voir leurs témoignages" ON public.testimonials;
DROP POLICY IF EXISTS "Les propriétaires peuvent modifier leurs témoignages" ON public.testimonials;
DROP POLICY IF EXISTS "Les propriétaires peuvent supprimer leurs témoignages" ON public.testimonials;
DROP POLICY IF EXISTS "Lecture publique des témoignages approuvés" ON public.testimonials;
DROP POLICY IF EXISTS "Création publique de témoignages" ON public.testimonials;

-- PROFILES ---

-- Tout le monde peut lire les profils (nécessaire pour /collect/[id] et /wall/[id])
CREATE POLICY "Lecture publique des profils"
  ON public.profiles FOR SELECT
  USING (true);

-- Un utilisateur peut insérer son propre profil
CREATE POLICY "Insertion de son propre profil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Un utilisateur peut modifier son propre profil
CREATE POLICY "Modification de son propre profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- TESTIMONIALS ---

-- Un propriétaire peut voir tous ses témoignages (quel que soit le statut)
CREATE POLICY "Propriétaire voit ses témoignages"
  ON public.testimonials FOR SELECT
  USING (auth.uid() = owner_id);

-- Les témoignages approuvés sont lisibles par tous (wall public)
CREATE POLICY "Témoignages approuvés publics"
  ON public.testimonials FOR SELECT
  USING (status = 'approved');

-- N'importe qui peut créer un témoignage (formulaire public /collect)
CREATE POLICY "Création publique de témoignages"
  ON public.testimonials FOR INSERT
  WITH CHECK (true);

-- Un propriétaire peut modifier ses témoignages (approuver/refuser)
CREATE POLICY "Propriétaire modifie ses témoignages"
  ON public.testimonials FOR UPDATE
  USING (auth.uid() = owner_id);

-- Un propriétaire peut supprimer ses témoignages
CREATE POLICY "Propriétaire supprime ses témoignages"
  ON public.testimonials FOR DELETE
  USING (auth.uid() = owner_id);
