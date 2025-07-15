-- Migration to update reservations and orders workflow
-- Updates status values, adds constraints, and creates reservation_proposed_changes table
-- Created: 2025-07-14

BEGIN;

-- Step 1: Migrate existing reservation status data
UPDATE reservations 
SET status = 'customer-canceled' 
WHERE status = 'canceled';

UPDATE reservations 
SET status = 'vendor-changed' 
WHERE status = 'changed';

-- Step 2: Migrate existing order status data
UPDATE orders 
SET status = 'waiting-approval' 
WHERE status = 'reserved-order';

UPDATE orders 
SET status = 'pending' 
WHERE status IN ('purchased', 'reservation-accepted');

UPDATE orders 
SET status = 'canceled' 
WHERE status IN ('reservation-rejected', 'canceled');

UPDATE orders 
SET status = 'waiting-approval' 
WHERE status = 'reservation-changed';

-- Step 3: Update reservation status constraint
ALTER TABLE reservations 
DROP CONSTRAINT IF EXISTS reservations_status_check;

ALTER TABLE reservations 
ADD CONSTRAINT reservations_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'vendor-changed', 'customer-changed', 'customer-canceled', 'vendor-canceled'));

-- Step 4: Update order status constraint
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('waiting-approval', 'pending', 'completed', 'canceled', 'customer-missed', 'vendor-missed'));

-- Step 5: Add max_time column to orders table (nullable)
ALTER TABLE orders ADD COLUMN max_time TIMESTAMPTZ;

-- Step 6: Remove columns from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS schedule_id;
ALTER TABLE orders DROP COLUMN IF EXISTS stripe_account_id;
ALTER TABLE orders DROP COLUMN IF EXISTS is_deleted;

-- Step 7: Remove proposed_changes column from reservations table
ALTER TABLE reservations DROP COLUMN IF EXISTS proposed_changes;

-- Step 8: Create reservation_proposed_changes table
CREATE TABLE reservation_proposed_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  kiosq_id UUID REFERENCES kiosqs(id) ON DELETE SET NULL,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('customer-change', 'vendor-change')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 9: Create indexes for reservation_proposed_changes
CREATE INDEX idx_reservation_proposed_changes_reservation_id ON reservation_proposed_changes(reservation_id);
CREATE INDEX idx_reservation_proposed_changes_order_id ON reservation_proposed_changes(order_id);
CREATE INDEX idx_reservation_proposed_changes_kiosq_id ON reservation_proposed_changes(kiosq_id);
CREATE INDEX idx_reservation_proposed_changes_product_variant_id ON reservation_proposed_changes(product_variant_id);
CREATE INDEX idx_reservation_proposed_changes_changed_by ON reservation_proposed_changes(changed_by);

-- Step 10: Create index for max_time column
CREATE INDEX idx_orders_max_time ON orders(max_time) WHERE max_time IS NOT NULL;

-- Step 11: Enable RLS for reservation_proposed_changes
ALTER TABLE reservation_proposed_changes ENABLE ROW LEVEL SECURITY;

-- Step 12: Create RLS policies for reservation_proposed_changes
CREATE POLICY reservation_proposed_changes_view_customer ON reservation_proposed_changes 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM reservations r 
    WHERE r.id = reservation_id AND r.customer_id = auth.uid()
  )
);

CREATE POLICY reservation_proposed_changes_view_vendor ON reservation_proposed_changes 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM reservations r 
    JOIN profiles p ON r.vendor_profile_id = p.id 
    WHERE r.id = reservation_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY reservation_proposed_changes_insert_customer ON reservation_proposed_changes 
FOR INSERT WITH CHECK (
  change_type = 'customer-change' AND
  changed_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM reservations r 
    WHERE r.id = reservation_id AND r.customer_id = auth.uid()
  )
);

CREATE POLICY reservation_proposed_changes_insert_vendor ON reservation_proposed_changes 
FOR INSERT WITH CHECK (
  change_type = 'vendor-change' AND
  changed_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM reservations r 
    JOIN profiles p ON r.vendor_profile_id = p.id 
    WHERE r.id = reservation_id AND p.user_id = auth.uid()
  )
);

-- Step 13: Create function for reservation status transition constraints
CREATE OR REPLACE FUNCTION check_reservation_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Terminal states cannot be changed
  IF OLD.status IN ('customer-canceled', 'vendor-canceled', 'rejected') THEN
    RAISE EXCEPTION 'Cannot change status from terminal state: %', OLD.status;
  END IF;
  
  -- Accepted can only change to completed
  IF OLD.status = 'accepted' AND NEW.status != 'completed' THEN
    RAISE EXCEPTION 'Accepted reservations can only change to completed status';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 14: Create function for order status transition constraints
CREATE OR REPLACE FUNCTION check_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Terminal states cannot be changed
  IF OLD.status IN ('completed', 'customer-missed', 'vendor-missed', 'canceled') THEN
    RAISE EXCEPTION 'Cannot change status from terminal state: %', OLD.status;
  END IF;
  
  -- waiting-approval can only change to pending
  IF OLD.status = 'waiting-approval' AND NEW.status != 'pending' THEN
    RAISE EXCEPTION 'Waiting approval orders can only change to pending status';
  END IF;
  
  -- pending can only change to specific states
  IF OLD.status = 'pending' AND NEW.status NOT IN ('completed', 'customer-missed', 'vendor-missed', 'canceled') THEN
    RAISE EXCEPTION 'Pending orders can only change to completed, customer-missed, vendor-missed, or canceled status';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 15: Create function for reservation deletion constraint
CREATE OR REPLACE FUNCTION check_reservation_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only pending reservations can change is_deleted
  IF OLD.is_deleted != NEW.is_deleted AND OLD.status != 'pending' THEN
    RAISE EXCEPTION 'Only pending reservations can change is_deleted status';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 16: Create trigger for order status sync when reservation status changes
CREATE OR REPLACE FUNCTION sync_order_status_on_reservation_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update order status based on reservation status
  IF NEW.status = 'accepted' THEN
    UPDATE orders SET status = 'pending' WHERE reservation_id = NEW.id;
  ELSIF NEW.status IN ('customer-canceled', 'vendor-canceled') THEN
    UPDATE orders SET status = 'canceled' WHERE reservation_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 17: Create triggers
CREATE TRIGGER reservation_status_transition_check
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION check_reservation_status_transition();

CREATE TRIGGER order_status_transition_check
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_order_status_transition();

CREATE TRIGGER reservation_deletion_check
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION check_reservation_deletion();

CREATE TRIGGER sync_order_status_trigger
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION sync_order_status_on_reservation_change();

-- Step 18: Update RLS policies for reservations (approval rules)
DROP POLICY IF EXISTS reservations_update_vendor ON reservations;

-- Vendors can update reservations with status 'customer-changed' or 'pending'
CREATE POLICY reservations_update_vendor ON reservations 
FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM profiles WHERE id = vendor_profile_id) AND
  status IN ('customer-changed', 'pending')
);

-- Customers can update reservations with status 'vendor-changed' or 'pending' (for cancellation)
CREATE POLICY reservations_update_customer ON reservations 
FOR UPDATE USING (
  auth.uid() = customer_id AND
  status IN ('vendor-changed', 'pending')
);

-- Step 19: Update RLS policies for orders
CREATE POLICY orders_update_customer ON orders 
FOR UPDATE USING (auth.uid() = customer_id);

-- Step 20: Set initial order status to waiting-approval for new reservations
CREATE OR REPLACE FUNCTION set_initial_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new reservation is created, set corresponding order to waiting-approval
  IF TG_OP = 'INSERT' THEN
    UPDATE orders SET status = 'waiting-approval' WHERE reservation_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_initial_order_status_trigger
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION set_initial_order_status();

COMMIT; 