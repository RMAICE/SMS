-- Verify sms:appschema on pg

SELECT pg_catalog.has_schema_privilege('sms', 'usage');
