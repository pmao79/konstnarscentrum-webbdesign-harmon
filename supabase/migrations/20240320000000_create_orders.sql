-- Create enum for order status
CREATE TYPE order_status AS ENUM ('obekräftad', 'betald', 'avbruten');

-- Create enum for payment method
CREATE TYPE payment_method AS ENUM ('Swish', 'Klarna', 'Kort');

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_status order_status NOT NULL DEFAULT 'obekräftad',
    total_amount DECIMAL(10,2) NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    payment_method payment_method NOT NULL
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id UUID NOT NULL REFERENCES produktvarianter(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Add RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all orders
CREATE POLICY "Admins can read all orders" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to update orders
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow admins to read all order items
CREATE POLICY "Admins can read all order items" ON order_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to update order items
CREATE POLICY "Admins can update order items" ON order_items
    FOR UPDATE USING (auth.role() = 'authenticated'); 