-- Add 'is_template' column to meshes
alter table meshes add column is_template boolean default false;

-- Allow read access to template meshes for everyone (or at least authenticated users)
create policy "Anyone can view template meshes" on meshes
for select using (is_template = true);

-- Insert initial mesh templates (linked to no specific user or a system user, but accessible by policy)
-- Note: inserting them with auth.uid() might link to current user. Ideally system data should be separate.
-- For simplicity, we just insert them and mark is_template=true. The user running this migration becomes the owner, but policy allows all to view.

INSERT INTO public.meshes (tela, metros, bitola, espacamento, dimensao, t, l, peso, is_template) VALUES
('EQ 045', 60, 3.4, '20x20', '2,00 X 3,00', 15, 10, 4.28, true),
('EQ 061', 82, 3.4, '15x15', '2,00 X 3,00', 20, 14, 5.85, true),
('EQ 092', 82, 4.2, '15x15', '2,00 X 3,00', 20, 14, 8.91, true),
('EQ 138', 120, 4.2, '10x10', '2,00 X 3,00', 30, 20, 13.05, true),
('Q 061', 200, 3.4, '15x15', '2,45 X 6,00', 40, 17, 14.25, true),
('Q 075', 200, 3.8, '15x15', '2,45 X 6,00', 40, 17, 17.80, true),
('Q 092', 200, 4.2, '15x15', '2,45 X 6,00', 40, 17, 21.74, true),
('Q 113', 297, 3.8, '10x10', '2,45 X 6,00', 60, 25, 26.43, true),
('Q 138', 297, 4.2, '10x10', '2,45 X 6,00', 60, 25, 32.28, true),
('Q 159', 297, 4.5, '10x10', '2,45 X 6,00', 60, 25, 37.06, true),
('Q 196', 297, 5.0, '10x10', '2,45 X 6,00', 60, 25, 45.75, true),
('Q 246', 297, 5.6, '10x10', '2,45 X 6,00', 60, 25, 57.40, true),
('Q 283', 297, 6.0, '10x10', '2,45 X 6,00', 60, 25, 65.88, true);
