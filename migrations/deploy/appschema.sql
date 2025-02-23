-- Deploy sms:appschema to pg

begin;

create schema sms;

do $$
begin
  execute format(
    'alter database %s set search_path = sms,public;',
    current_database()
  );
end $$;

commit;
