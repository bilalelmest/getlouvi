-- ============================================
-- LOUVI — Données de démonstration
-- ============================================
--
-- INSTRUCTIONS :
-- 1. D'abord, créez un compte via l'interface Louvi (/signup)
-- 2. Récupérez votre user ID dans Supabase > Authentication > Users
-- 3. Remplacez TOUTES les occurrences de 'VOTRE_USER_ID_ICI' par votre UUID
-- 4. Exécutez ce script dans Supabase > SQL Editor
--
-- Exemple d'UUID : '550e8400-e29b-41d4-a716-446655440000'

INSERT INTO public.testimonials (owner_id, author_name, author_role, author_company, rating, content, status, created_at)
VALUES
  (
    'VOTRE_USER_ID_ICI',
    'Marie Dupont',
    'CEO',
    'TechStart',
    5,
    'Louvi a transformé notre page d''accueil. Nos prospects voient immédiatement les retours positifs de nos clients et ça booste nos conversions de 35%. Un outil vraiment indispensable pour toute entreprise qui veut renforcer sa crédibilité.',
    'approved',
    NOW() - INTERVAL '15 days'
  ),
  (
    'VOTRE_USER_ID_ICI',
    'Thomas Bernard',
    'Directeur Marketing',
    'GrowthLab',
    5,
    'Simple, élégant et efficace. Le Wall of Love est magnifique et s''intègre parfaitement à notre site vitrine. On a reçu des compliments de nos visiteurs sur la présentation des avis.',
    'approved',
    NOW() - INTERVAL '10 days'
  ),
  (
    'VOTRE_USER_ID_ICI',
    'Sophie Martin',
    'Freelance Designer',
    NULL,
    4,
    'J''utilise Louvi pour mon portfolio freelance. Mes clients laissent un avis en 30 secondes grâce au formulaire en 3 étapes. C''est rapide et bien pensé.',
    'approved',
    NOW() - INTERVAL '7 days'
  ),
  (
    'VOTRE_USER_ID_ICI',
    'Lucas Moreau',
    'CTO',
    'DataFlow',
    5,
    'L''intégration est ultra simple. Un iframe à copier-coller et c''est en ligne. Le widget carrousel est superbe et totalement responsive sur mobile.',
    'pending',
    NOW() - INTERVAL '3 days'
  ),
  (
    'VOTRE_USER_ID_ICI',
    'Emma Leroy',
    'Fondatrice',
    'BienÊtre Studio',
    5,
    'Mes clientes adorent laisser leurs avis. L''interface est intuitive et le résultat est professionnel. La modération est simple et rapide. Je recommande à 100% !',
    'pending',
    NOW() - INTERVAL '1 day'
  );
