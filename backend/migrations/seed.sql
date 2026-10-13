-- seed.sql: optional demo template
INSERT INTO templates (name, schema)
VALUES ('Demo template', '[{"id": "f1","type":"text","label":"Full name"},{"id":"f2","type":"select","label":"Choice","options":["A","B"]}]'::jsonb)
ON CONFLICT DO NOTHING;
