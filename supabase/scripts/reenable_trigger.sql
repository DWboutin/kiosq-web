-- Re-enable the trigger that prevents role changes
CREATE TRIGGER enforce_role_change_rules
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION check_role_change(); 