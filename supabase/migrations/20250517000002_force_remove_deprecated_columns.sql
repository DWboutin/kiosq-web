-- Force remove deprecated columns and related triggers
-- Created: 2025-05-17

BEGIN;

-- Step 1: Find and drop non-system triggers on products table
DO $$
DECLARE
    trigger_name text;
    trigger_on text;
BEGIN
    FOR trigger_name, trigger_on IN (
        SELECT t.tgname, c.relname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'products'
        AND NOT t.tgisinternal
    )
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trigger_name) || ' ON ' || quote_ident(trigger_on);
        RAISE NOTICE 'Dropped trigger % on % table', trigger_name, trigger_on;
    END LOOP;
END $$;

-- Step 2: Force drop any views that might depend on these columns
DO $$
DECLARE
    view_name text;
    view_schema text;
BEGIN
    -- Drop materialized views first
    FOR view_name, view_schema IN (
        SELECT m.matviewname, m.schemaname
        FROM pg_matviews m
        WHERE m.definition ~* 'products\.status|products\.user_id|status_deprecated|user_id_deprecated'
    )
    LOOP
        EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS ' || quote_ident(view_schema) || '.' || quote_ident(view_name) || ' CASCADE';
        RAISE NOTICE 'Dropped materialized view %.%', view_schema, view_name;
    END LOOP;

    -- Drop regular views
    FOR view_name, view_schema IN (
        SELECT v.viewname, v.schemaname
        FROM pg_views v
        WHERE v.definition ~* 'products\.status|products\.user_id|status_deprecated|user_id_deprecated'
    )
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(view_schema) || '.' || quote_ident(view_name) || ' CASCADE';
        RAISE NOTICE 'Dropped view %.%', view_schema, view_name;
    END LOOP;
END $$;

-- Step 3: Force drop indexes that reference these columns
DROP INDEX IF EXISTS idx_products_status;
DROP INDEX IF EXISTS idx_products_user_id;
DROP INDEX IF EXISTS idx_products_status_deprecated;
DROP INDEX IF EXISTS idx_products_user_id_deprecated;

-- Step 4: Attempt to directly drop dependent objects if we can find them
DO $$
DECLARE
    dep_name text;
    dep_schema text;
    dep_type text;
BEGIN
    -- Use a query to find dependent objects (simplified version)
    FOR dep_name, dep_schema, dep_type IN (
        SELECT DISTINCT c.relname, n.nspname, 
               CASE c.relkind 
                 WHEN 'r' THEN 'TABLE'
                 WHEN 'v' THEN 'VIEW'
                 WHEN 'm' THEN 'MATERIALIZED VIEW'
                 WHEN 'i' THEN 'INDEX'
                 WHEN 'S' THEN 'SEQUENCE'
                 WHEN 'f' THEN 'FOREIGN TABLE'
                 ELSE c.relkind::text
               END
        FROM pg_depend d
        JOIN pg_class c ON d.refobjid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_class rc ON d.objid = rc.oid
        JOIN pg_attribute a ON c.oid = a.attrelid AND a.attnum = d.refobjsubid
        WHERE rc.relname = 'products'
        AND a.attname IN ('status_deprecated', 'user_id_deprecated')
        AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    )
    LOOP
        BEGIN
            IF dep_type = 'VIEW' THEN
                EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(dep_schema) || '.' || quote_ident(dep_name) || ' CASCADE';
            ELSIF dep_type = 'MATERIALIZED VIEW' THEN
                EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS ' || quote_ident(dep_schema) || '.' || quote_ident(dep_name) || ' CASCADE';
            ELSIF dep_type = 'INDEX' THEN
                EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(dep_schema) || '.' || quote_ident(dep_name);
            END IF;
            RAISE NOTICE 'Dropped % %.%', dep_type, dep_schema, dep_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop % %.%: %', dep_type, dep_schema, dep_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 5: Set session to bypass constraints
SET session_replication_role = replica;

-- Step 6: Force drop the deprecated columns with CASCADE
-- The CASCADE option will automatically drop objects that depend on these columns
ALTER TABLE products DROP COLUMN IF EXISTS status_deprecated CASCADE;
ALTER TABLE products DROP COLUMN IF EXISTS user_id_deprecated CASCADE;

-- Step 7: Reset session
SET session_replication_role = default;

-- Step 8: Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed. Status_deprecated and user_id_deprecated columns have been removed.';
END $$;

COMMIT; 