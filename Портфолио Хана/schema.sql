CREATE TABLE IF NOT EXISTS projects (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  repository TEXT NOT NULL,
  repo_path TEXT NOT NULL,
  source_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS projects_sort_order_idx
  ON projects (sort_order, title);

INSERT INTO projects
  (slug, title, category, description, repository, repo_path, source_url, sort_order)
VALUES
  ('ala-clinic', 'Ala Clinic', 'dental', 'Демонстрация сайта стоматологии: направления лечения, знакомство с клиникой и запись.', 'Main-Portfolio', 'Ala Clinic', 'https://github.com/Rad1xx1/Main-Portfolio/tree/main/Ala%20Clinic', 1),
  ('almeda-stom', 'Almeda Stom', 'dental', 'Концепция сайта стоматологии с услугами и информацией для пациентов.', 'Main-Portfolio', 'Almeda Stom', 'https://github.com/Rad1xx1/Main-Portfolio/tree/main/Almeda%20Stom', 2),
  ('dental-park', 'Dental Park', 'dental', 'Дизайн-концепция стоматологии: услуги, ориентиры стоимости и запись на консультацию.', 'Main-Portfolio', 'Dental Park', 'https://github.com/Rad1xx1/Main-Portfolio/tree/main/Dental%20Park', 3),
  ('imatek-dent', 'Иматэк-Дент', 'dental', 'Демонстрационная концепция сайта: направления стоматологии, специалисты и контакты.', 'Main-Portfolio', 'Иматэк-Дент', 'https://github.com/Rad1xx1/Main-Portfolio/tree/main/%D0%98%D0%BC%D0%B0%D1%82%D1%8D%D0%BA-%D0%94%D0%B5%D0%BD%D1%82', 4),
  ('alani', 'Alani', 'food', 'Концепция сайта ресторана: меню, атмосфера и запрос брони столика.', 'Main-Portfolio', 'Alani', 'https://github.com/Rad1xx1/Main-Portfolio/tree/main/Alani', 5),
  ('coffee-original', 'Coffee Original', 'food', 'Концепция сайта кофейни с завтраками и выбором места.', 'Main-Portfolio', 'Coffee Original', 'https://github.com/Rad1xx1/Main-Portfolio/tree/main/Coffee%20Original', 6),
  ('lati-cafe', 'Lati Cafe', 'food', 'Дизайн-концепция кафе с кофе, завтраками и десертами.', 'Main-Portfolio', 'Lati Cafe', 'https://github.com/Rad1xx1/Main-Portfolio/tree/main/Lati%20Cafe', 7),
  ('silver-climat', 'Silver Climat', 'business', 'Демонстрация каталога климатической техники с подбором решения.', 'Main-Portfolio', 'Silver Climat', 'https://github.com/Rad1xx1/Main-Portfolio/tree/main/Silver%20Climat', 8),
  ('felix-almaty', 'Феликс Алматы', 'business', 'Каталог мебели и решений для жилых и коммерческих пространств.', 'Main-Portfolio', 'Феликс Алматы/felix-web/dist', 'https://github.com/Rad1xx1/Main-Portfolio/tree/main/%D0%A4%D0%B5%D0%BB%D0%B8%D0%BA%D1%81%20%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B', 9);
