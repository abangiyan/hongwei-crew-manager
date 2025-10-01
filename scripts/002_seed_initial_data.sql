-- Insert branches
INSERT INTO branches (name, address) VALUES
  ('Aniva', 'Lokasi Aniva'),
  ('Sinpasa', 'Lokasi Sinpasa')
ON CONFLICT (name) DO NOTHING;

-- Insert teams
INSERT INTO teams (name, description) VALUES
  ('Kitchen', 'Tim Dapur - Bertanggung jawab untuk persiapan dan memasak makanan'),
  ('Frontline', 'Tim Frontline - Bertanggung jawab untuk layanan pelanggan dan operasional depan')
ON CONFLICT DO NOTHING;

-- Get team IDs for role assignment
DO $$
DECLARE
  kitchen_team_id UUID;
  frontline_team_id UUID;
BEGIN
  SELECT id INTO kitchen_team_id FROM teams WHERE name = 'Kitchen';
  SELECT id INTO frontline_team_id FROM teams WHERE name = 'Frontline';

  -- Insert roles
  INSERT INTO roles (name, team_id) VALUES
    ('Kasir', frontline_team_id),
    ('Barista', frontline_team_id),
    ('Cleaning Service', frontline_team_id),
    ('Waiters', frontline_team_id),
    ('Masak', kitchen_team_id),
    ('Bakar Roti', kitchen_team_id)
  ON CONFLICT (name) DO NOTHING;
END $$;

-- Insert job tasks
INSERT INTO job_tasks (name, description) VALUES
  ('Kasir', 'Menangani transaksi pembayaran'),
  ('Goreng-goreng', 'Menggoreng makanan'),
  ('Barista', 'Membuat minuman kopi dan non-kopi'),
  ('Bersih-bersih', 'Membersihkan area restoran'),
  ('Masak', 'Memasak makanan utama'),
  ('Bakar Roti', 'Membakar dan menyiapkan roti'),
  ('Antar Makanan', 'Mengantar makanan ke meja pelanggan'),
  ('Cuci Piring', 'Mencuci piring dan peralatan dapur')
ON CONFLICT (name) DO NOTHING;

-- Insert shifts
INSERT INTO shifts (name, start_time, end_time) VALUES
  ('Shift 1', '05:30:00', '13:30:00'),
  ('Shift 2', '13:30:00', '21:30:00')
ON CONFLICT DO NOTHING;
