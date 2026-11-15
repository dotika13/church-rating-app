-- RPC function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_church_aggregates()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY church_aggregates;
END;
$$;

-- Enable pg_cron and schedule hourly refresh
-- Run in Supabase SQL editor:
-- SELECT cron.schedule('refresh-church-aggregates-hourly', '0 * * * *', 'SELECT refresh_church_aggregates();');