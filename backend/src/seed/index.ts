import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Customer } from '../models/Customer';
import { Supplier } from '../models/Supplier';
import { Account } from '../models/Account';
import * as accountService from '../services/accountService';
import * as orderService from '../services/orderService';

const CATEGORIES = ['T-Shirts', 'Jeans', 'Dresses', 'Jackets', 'Activewear', 'Accessories'];
const BRANDS = ['Urban Thread', 'NorthLine', 'Velora', 'Driftwood Co.', 'Solace Apparel'];
const COLORS = ['Black', 'White', 'Navy', 'Beige', 'Olive', 'Burgundy'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  await connectDB();
  logger.info('Starting seed...');

  // --- Users ---
  const existingAdmin = await User.findOne({ email: 'admin@clothingerp.com' });
  let admin = existingAdmin;
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      email: 'admin@clothingerp.com',
      password: 'Admin@12345',
      role: 'admin',
    });
  }

  const seedUsers = [
    { name: 'Sara Accountant', email: 'accountant@clothingerp.com', password: 'Pass@12345', role: 'accountant' },
    {
      name: 'Omar Inventory',
      email: 'inventory@clothingerp.com',
      password: 'Pass@12345',
      role: 'inventory_manager',
    },
    { name: 'Lina Sales', email: 'sales@clothingerp.com', password: 'Pass@12345', role: 'sales_employee' },
  ] as const;

  for (const u of seedUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) await User.create(u);
  }
  logger.info('Users seeded');

  // --- Chart of Accounts ---
  await accountService.seedDefaultChartOfAccounts();
  logger.info('Chart of accounts seeded');

  // --- Products ---
  const productCount = await Product.countDocuments();
  const products = [];
  if (productCount === 0) {
    for (let i = 1; i <= 40; i++) {
      const category = randomFrom(CATEGORIES);
      const cost = randomInt(8, 40);
      const product = await Product.create({
        name: `${category.slice(0, -1)} ${randomFrom(['Classic', 'Premium', 'Essential', 'Signature'])} #${i}`,
        sku: `SKU-${String(i).padStart(4, '0')}`,
        barcode: `8${randomInt(100000000000, 999999999999)}`,
        category,
        brand: randomFrom(BRANDS),
        color: randomFrom(COLORS),
        size: randomFrom(SIZES),
        costPrice: cost,
        sellingPrice: Math.round(cost * (1.6 + Math.random())),
        quantity: randomInt(0, 150),
        lowStockThreshold: 15,
        createdBy: admin.id,
      });
      products.push(product);
    }
    logger.info(`${products.length} products seeded`);
  } else {
    products.push(...(await Product.find()));
    logger.info('Products already exist, skipping');
  }

  // --- Customers ---
  const customerCount = await Customer.countDocuments();
  const customers = [];
  if (customerCount === 0) {
    const names = [
      'Mona Hassan', 'Ahmed Tarek', 'Layla Ibrahim', 'Youssef Adel', 'Nour Mahmoud',
      'Karim Saeed', 'Dina Fathy', 'Hossam Aly', 'Rania Samir', 'Tarek Nabil',
    ];
    for (const name of names) {
      const customer = await Customer.create({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: `+201${randomInt(100000000, 999999999)}`,
        city: randomFrom(['Cairo', 'Giza', 'Alexandria', 'Qena', 'Luxor']),
      });
      customers.push(customer);
    }
    logger.info(`${customers.length} customers seeded`);
  } else {
    customers.push(...(await Customer.find()));
    logger.info('Customers already exist, skipping');
  }

  // --- Suppliers ---
  const supplierCount = await Supplier.countDocuments();
  if (supplierCount === 0) {
    const supplierNames = ['Textile Source Co.', 'Nile Fabrics', 'Delta Garment Supply', 'Cairo Cotton Mills'];
    for (const name of supplierNames) {
      await Supplier.create({
        name,
        contactPerson: 'Procurement Desk',
        phone: `+201${randomInt(100000000, 999999999)}`,
        email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@supplier.com`,
      });
    }
    logger.info(`${supplierNames.length} suppliers seeded`);
  } else {
    logger.info('Suppliers already exist, skipping');
  }

  // --- Sample Orders ---
  const orderCount = await mongoose.connection.collection('orders').countDocuments();
  if (orderCount === 0 && customers.length && products.length) {
    for (let i = 0; i < 15; i++) {
      const customer = randomFrom(customers);
      const itemCount = randomInt(1, 3);
      const items = [];
      const usedProducts = new Set<string>();

      for (let j = 0; j < itemCount; j++) {
        let product = randomFrom(products.filter((p) => p.quantity > 5));
        if (!product || usedProducts.has(product.id)) continue;
        usedProducts.add(product.id);
        items.push({ product: product.id, quantity: randomInt(1, 3) });
      }

      if (items.length === 0) continue;

      try {
        await orderService.createOrder({
          customer: customer.id,
          items,
          discount: Math.random() > 0.7 ? randomInt(5, 20) : 0,
          taxRate: 14,
          shippingCost: randomInt(20, 60),
          createdBy: admin.id,
        });
      } catch (err) {
        logger.warn(`Skipped sample order due to: ${(err as Error).message}`);
      }
    }
    logger.info('Sample orders seeded');
  } else {
    logger.info('Orders already exist or missing data, skipping');
  }

  logger.info('Seed complete.');
  logger.info('Login with: admin@clothingerp.com / Admin@12345');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
