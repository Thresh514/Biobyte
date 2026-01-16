-- PostgreSQL Database Schema for Biobyte
-- 数据库 Schema 设计

-- 创建 ENUM 类型
CREATE TYPE user_role AS ENUM ('admin', 'member', 'guest');
CREATE TYPE resource_type AS ENUM ('Mindmap', 'Syllabus Analysis');
CREATE TYPE membership_type AS ENUM ('free', 'premium', 'lifetime');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');
CREATE TYPE payment_method AS ENUM ('paypal', 'wechat', 'alipay', 'free');

-- 1. users 表（用户表）
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role user_role DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255),
    reset_expires TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);

-- 创建 updated_at 自动更新触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 users 表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. study_resources 表（商品表）
CREATE TABLE study_resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type resource_type NOT NULL,
    level VARCHAR(10),
    chapter VARCHAR(10),
    file_path VARCHAR(255) NOT NULL,
    format VARCHAR(10) DEFAULT 'pdf',
    price DECIMAL(10,2) DEFAULT 0.00,
    image VARCHAR(255),
    image1 VARCHAR(255),
    image2 VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_study_resources_type_level ON study_resources(type, level);
CREATE INDEX idx_study_resources_price ON study_resources(price);

-- 为 study_resources 表创建触发器
CREATE TRIGGER update_study_resources_updated_at BEFORE UPDATE ON study_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. membership 表（会员表）
CREATE TABLE membership (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    membership_type membership_type DEFAULT 'free',
    start_date TIMESTAMP NOT NULL,
    expire_date TIMESTAMP,
    status membership_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_membership_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_membership_user UNIQUE (user_id)
);

-- 创建索引
CREATE INDEX idx_membership_status ON membership(status);
CREATE INDEX idx_membership_expire_date ON membership(expire_date);

-- 为 membership 表创建触发器
CREATE TRIGGER update_membership_updated_at BEFORE UPDATE ON membership
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. orders 表（订单主表）
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER,
    user_email VARCHAR(100) NOT NULL,
    user_name VARCHAR(100),
    total_price DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'PENDING',
    payment_method payment_method DEFAULT 'paypal',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_id ON orders(order_id);

-- 为 orders 表创建触发器
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. order_items 表（订单明细表）
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    study_resource_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_resource FOREIGN KEY (study_resource_id) REFERENCES study_resources(id) ON DELETE RESTRICT
);

-- 创建索引
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_study_resource_id ON order_items(study_resource_id);

-- 6. verification_codes 表（验证码表）
CREATE TABLE verification_codes (
    email VARCHAR(255) PRIMARY KEY,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. annotations 表（注释表）
CREATE TABLE annotations (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    start_offset INTEGER NOT NULL,
    end_offset INTEGER NOT NULL,
    annotation TEXT NOT NULL,
    unit_id VARCHAR(50),
    section_id VARCHAR(50),
    item_id VARCHAR(50),
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_annotations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX idx_annotations_user_unit ON annotations(user_id, unit_id);
CREATE INDEX idx_annotations_user_section ON annotations(user_id, section_id);
CREATE INDEX idx_annotations_user_item ON annotations(user_id, item_id);

-- 为 annotations 表创建触发器
CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON annotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. highlights 表（高亮表）
CREATE TABLE highlights (
    id SERIAL PRIMARY KEY,
    section_id VARCHAR(50),
    item_id VARCHAR(50),
    user_id INTEGER DEFAULT 1,
    serialized_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_highlights_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX idx_highlights_user_section ON highlights(user_id, section_id);
CREATE INDEX idx_highlights_user_item ON highlights(user_id, item_id);

-- 添加注释说明
COMMENT ON TABLE users IS '用户表，存储用户基本信息和登录凭证';
COMMENT ON TABLE study_resources IS '商品表，存储所有学习资源商品信息。price=0.00表示免费，price>0.00表示付费，price=-1.00表示会员专享';
COMMENT ON TABLE membership IS '会员表，存储用户会员信息和会员类型';
COMMENT ON TABLE orders IS '订单主表，存储订单基本信息';
COMMENT ON TABLE order_items IS '订单明细表，存储订单中的商品明细';
COMMENT ON TABLE verification_codes IS '验证码表，存储邮箱验证码（注册/找回密码）';
COMMENT ON TABLE annotations IS '注释表，存储用户对学习内容的注释';
COMMENT ON TABLE highlights IS '高亮表，存储用户对学习内容的高亮标记';

COMMENT ON COLUMN study_resources.price IS '价格：0.00=免费商品，>0.00=付费商品，-1.00=会员专享商品';
COMMENT ON COLUMN membership.expire_date IS 'NULL表示永久会员';
COMMENT ON COLUMN orders.user_id IS '可为NULL，支持未登录用户下单';
