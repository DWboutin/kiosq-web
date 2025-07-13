CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kiosq_id UUID REFERENCES kiosqs(id) ON DELETE SET NULL,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  reservation_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'canceled', 'changed')),
  stripe_payment_intent_id TEXT,
  stripe_account_id TEXT,
  proposed_changes JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE INDEX idx_reservations_vendor_profile_id ON reservations(vendor_profile_id);
CREATE INDEX idx_reservations_status ON reservations(status);

CREATE TRIGGER set_timestamp_reservations
BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY reservations_view_own ON reservations FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY reservations_view_vendor ON reservations FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = vendor_profile_id));
CREATE POLICY reservations_update_vendor ON reservations FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = vendor_profile_id));

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kiosq_id UUID REFERENCES kiosqs(id) ON DELETE SET NULL,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  order_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'reserved-order' CHECK (status IN (
    'reserved-order', 'purchased', 'reservation-accepted', 'reservation-rejected', 'reservation-changed', 'canceled', 'completed'
  )),
  total_amount NUMERIC(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_account_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE INDEX idx_orders_vendor_profile_id ON orders(vendor_profile_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_reservation_id ON orders(reservation_id);

CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_view_own ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY orders_view_vendor ON orders FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = vendor_profile_id));
CREATE POLICY orders_update_vendor ON orders FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = vendor_profile_id));

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  unit VARCHAR(20) NOT NULL,
  options JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_reservation_id ON order_items(reservation_id);
CREATE INDEX idx_order_items_product_variant_id ON order_items(product_variant_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_items_view_via_order ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND auth.uid() = customer_id)); 

ALTER TABLE profiles ADD COLUMN stripe_account_id TEXT;

ALTER TABLE profiles ADD CONSTRAINT personal_no_stripe_check CHECK (type != 'personal' OR stripe_account_id IS NULL); 