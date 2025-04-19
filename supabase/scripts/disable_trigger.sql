-- Disable the trigger that prevents role changes
DROP TRIGGER IF EXISTS enforce_role_change_rules ON users; 