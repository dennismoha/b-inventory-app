import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories related to animal feeds
  const category1 = await prisma.categories.upsert({
    where: { category_slug: 'livestock-feeds' }, // Unique field to check for existence
    update: {}, // Do nothing if the record exists (or specify updates if needed)
    create: {
      category_slug: 'livestock-feeds',
      category_name: 'Livestock Feeds',
      description: 'Feed products for livestock animals like cows, goats, and sheep.'
    }
  });

  const category2 = await prisma.categories.upsert({
    where: { category_slug: 'poultry-feeds' },
    update: {},
    create: {
      category_slug: 'poultry-feeds',
      category_name: 'Poultry Feeds',
      description: 'Feed products for poultry like chickens, ducks, and turkeys.'
    }
  });

  const category3 = await prisma.categories.upsert({
    where: { category_slug: 'pet-feeds' },
    update: {},
    create: {
      category_slug: 'pet-feeds',
      category_name: 'Pet Feeds',
      description: 'Feed products for pets like dogs, cats, and rabbits.'
    }
  });

  // Create subcategories within each category
  const subcategory1 = await prisma.subCategories.upsert({
    where: { subcategory_name: 'Cattle Feed' },
    update: {},
    create: {
      subcategory_name: 'Cattle Feed',
      description: 'Complete feed for cattle (cows, bulls, etc.) to improve health and productivity.'
    }
  });

  const subcategory2 = await prisma.subCategories.upsert({
    where: { subcategory_name: 'Sheep and Goat Feed' },
    update: {},
    create: {
      subcategory_name: 'Sheep and Goat Feed',
      description: 'Nutritional feed for sheep and goats to support growth and reproduction.'
    }
  });

  const subcategory3 = await prisma.subCategories.upsert({
    where: { subcategory_name: 'Poultry Layer Feed' },
    update: {},
    create: {
      subcategory_name: 'Poultry Layer Feed',
      description: 'Feed specifically formulated for egg-laying poultry like hens.'
    }
  });

  const subcategory4 = await prisma.subCategories.upsert({
    where: { subcategory_name: 'Poultry Broiler Feed' },
    update: {},
    create: {
      subcategory_name: 'Poultry Broiler Feed',
      description: 'Feed designed to promote fast growth in broiler chickens for meat production.'
    }
  });

  const subcategory5 = await prisma.subCategories.upsert({
    where: { subcategory_name: 'Dog Food' }, // Unique field to check if this subcateogry exists
    update: {}, // if it does then we Do nothing if the record exists or we specify updates if needed
    create: {
      subcategory_name: 'Dog Food',
      description: 'High-quality dog food formulated for different breeds and sizes.'
    }
  });

  const subcategory6 = await prisma.subCategories.upsert({
    where: { subcategory_name: 'Cat Food' }, // Unique field to check if this subcateogry exists
    update: {}, // if it does then we Do nothing if the record exists or we specify updates if needed
    create: {
      subcategory_name: 'Cat Food',
      description: 'Nutrient-rich food for cats, including both dry and wet options.'
    }
  });

  // Create CategorySubCategory relationships (Many-to-Many)
  await prisma.categorySubCategory.upsert({
    where: {
      category_id_subcategory_id: {
        category_id: category1.categoryId,
        subcategory_id: subcategory1.subcategory_id
      }
    },
    update: {},
    create: {
      category_id: category1.categoryId,
      subcategory_id: subcategory1.subcategory_id
    }
  });

  await prisma.categorySubCategory.upsert({
    where: {
      category_id_subcategory_id: {
        category_id: category1.categoryId,
        subcategory_id: subcategory2.subcategory_id
      }
    },
    update: {},
    create: {
      category_id: category1.categoryId,
      subcategory_id: subcategory2.subcategory_id
    }
  });

  await prisma.categorySubCategory.upsert({
    where: {
      category_id_subcategory_id: {
        category_id: category2.categoryId,
        subcategory_id: subcategory3.subcategory_id
      }
    },
    update: {},
    create: {
      category_id: category2.categoryId,
      subcategory_id: subcategory3.subcategory_id
    }
  });

  await prisma.categorySubCategory.upsert({
    where: {
      category_id_subcategory_id: {
        category_id: category2.categoryId,
        subcategory_id: subcategory4.subcategory_id
      }
    },
    update: {},
    create: {
      category_id: category2.categoryId,
      subcategory_id: subcategory4.subcategory_id
    }
  });

  await prisma.categorySubCategory.upsert({
    where: {
      category_id_subcategory_id: {
        category_id: category3.categoryId,
        subcategory_id: subcategory5.subcategory_id
      }
    },
    update: {},
    create: {
      category_id: category3.categoryId,
      subcategory_id: subcategory5.subcategory_id
    }
  });

  await prisma.categorySubCategory.upsert({
    where: {
      category_id_subcategory_id: {
        category_id: category3.categoryId,
        subcategory_id: subcategory6.subcategory_id
      }
    },
    update: {},
    create: {
      category_id: category3.categoryId,
      subcategory_id: subcategory6.subcategory_id
    }
  });

  // Create units
  const unitKg = await prisma.units.upsert({
    where: {
      unit_short_name: {
        unit: 'Kilogram',
        short_name: 'kg'
      }
    },
    update: {},
    create: {
      unit: 'Kilogram',
      short_name: 'kg',
      no_of_products: 0
    }
  });

  const unitBag = await prisma.units.upsert({
    where: { unit: 'Bag' },
    update: {},
    create: {
      unit: 'Bag',
      short_name: 'bag',
      no_of_products: 0
    }
  });

  await prisma.units.upsert({
    where: { unit: 'Litre' },
    update: {},
    create: {
      unit: 'Litre',
      short_name: 'l',
      no_of_products: 0
    }
  });

  await prisma.units.upsert({
    where: { unit: 'Pound' },
    update: {},
    create: {
      unit: 'Pound',
      short_name: 'lb',
      no_of_products: 0
    }
  });

  await prisma.units.upsert({
    where: { unit: 'Gram' },
    update: {},
    create: {
      unit: 'Gram',
      short_name: 'g',
      no_of_products: 0
    }
  });

  await prisma.units.upsert({
    where: { unit: 'Ounce' },
    update: {},
    create: {
      unit: 'Ounce',
      short_name: 'oz',
      no_of_products: 0
    }
  });

  await prisma.units.upsert({
    where: { unit: 'Ton' },
    update: {},
    create: {
      unit: 'Ton',
      short_name: 'ton',
      no_of_products: 0
    }
  });

  // Create products (Animal feed products)
  const product1 = await prisma.products.create({
    data: {
      name: 'Premium Cattle Feed',
      description: 'A nutritious feed for cattle to improve milk production and overall health.',
      category_id: category1.categoryId, // referencing the category
      subcategory_id: subcategory1.subcategory_id, // referencing the subcategory
      image_url: 'http://example.com/premium-cattle-feed.jpg',
      sku: 'cattle-feed-001'
    }
  });

  await prisma.products.create({
    data: {
      name: 'Goat & Sheep Feed',
      description: 'Special feed mix designed for sheep and goats to optimize weight gain.',
      category_id: category1.categoryId,
      subcategory_id: subcategory2.subcategory_id,
      image_url: 'http://example.com/goat-sheep-feed.jpg',
      sku: 'goat-sheep-feed-001'
    }
  });

  await prisma.products.create({
    data: {
      name: 'Layer Chicken Feed',
      description: 'Feed formulated for layer hens to increase egg production and quality.',
      category_id: category2.categoryId,
      subcategory_id: subcategory3.subcategory_id,
      image_url: 'http://example.com/layer-chicken-feed.jpg',
      sku: 'layer-feed-001'
    }
  });

  await prisma.products.create({
    data: {
      name: 'Broiler Chicken Feed',
      description: 'Fast-growing feed for broiler chickens to maximize meat production.',
      category_id: category2.categoryId,
      subcategory_id: subcategory4.subcategory_id,
      image_url: 'http://example.com/broiler-chicken-feed.jpg',
      sku: 'broiler-feed-001'
    }
  });

  const product5 = await prisma.products.create({
    data: {
      name: 'Dog Food - Adult Formula',
      description: 'Complete and balanced dog food for adult dogs, ensuring optimal health.',
      category_id: category3.categoryId,
      subcategory_id: subcategory5.subcategory_id,
      image_url: 'http://example.com/dog-food.jpg',
      sku: 'dog-food-001'
    }
  });

  await prisma.products.create({
    data: {
      name: 'Cat Food - Premium Mix',
      description: 'High-quality dry food for cats with a mix of nutrients and flavors.',
      category_id: category3.categoryId,
      subcategory_id: subcategory6.subcategory_id,
      image_url: 'http://example.com/cat-food.jpg',
      sku: 'cat-food-001'
    }
  });

  // Create suppliers (Animal feed suppliers)
  const supplier1 = await prisma.suppliers.create({
    data: {
      name: 'FarmFeed Suppliers',
      address: '789 Farm Road, Agri City, TX',
      contact: '111-222-3333'
    }
  });

  const supplier2 = await prisma.suppliers.create({
    data: {
      name: 'AnimalNutra Co.',
      address: '987 Nutra Street, Feed Town, FL',
      contact: '444-555-6666'
    }
  });

  // Create SupplierProducts and SupplierPricing
  const supplierProduct1 = await prisma.supplierProducts.create({
    data: {
      supplier_id: supplier1.supplier_id,
      product_id: product1.product_id
    }
  });

  const supplierProduct2 = await prisma.supplierProducts.create({
    data: {
      supplier_id: supplier2.supplier_id,
      product_id: product5.product_id
    }
  });

  await prisma.supplierPricing.create({
    data: {
      supplier_products_id: supplierProduct1.supplier_products_id,
      Quantity: 100,
      unit_id: unitBag.unit_id,
      price: 50.0,
      effective_date: new Date()
    }
  });

  await prisma.supplierPricing.create({
    data: {
      supplier_products_id: supplierProduct2.supplier_products_id,
      Quantity: 100,
      unit_id: unitKg.unit_id,
      price: 20.0,
      effective_date: new Date()
    }
  });

  // Create an Order for Animal Feeds
  const order = await prisma.order.create({
    data: {
      orderName: 'Order 56789',
      totalAmount: 70.0,
      paymentStatus: 'paid',
      paymentMethod: 'BANK',
      orderDate: new Date(),
      shippingDate: new Date(),
      orderDeliveryDate: new Date(),
      orderStatus: 'fulfilled',
      supplier_id: supplier1.supplier_id
    }
  });

  // // Create OrderProducts
  // const orderProduct1 = await prisma.orderProducts.create({
  //   data: {
  //     orderId: order.orderId,
  //     productId: product1.product_id,
  //     productName: product1.name,
  //     quantity: 2,
  //     order_quantity: 2,
  //     price_per_unit: 50.00,
  //     unit_id: unitBag.unit_id,
  //     totalAmount: 100.00,
  //     supplierProductsPricingId: supplierpricing2.supplier_products_id,
  //   },
  // });

  // const orderProduct2 = await prisma.orderProducts.create({
  //   data: {
  //     orderId: order.orderId,
  //     productId: product5.product_id,
  //     productName: product5.name,
  //     quantity: 1,
  //     order_quantity: 1,
  //     price_per_unit: 20.00,
  //     unit_id: unitKg.unit_id,
  //     totalAmount: 20.00,
  //     supplierProductsPricingId:supplierpricing1.supplier_products_id,
  //   },
  // });

  // create customer
  await prisma.customer.create({
    data: {
      customerId: 'c1a2b3d4-e5f6-7890-abcd-1234567890ef',
      firstName: 'Walk-in',
      lastName: 'Customer',
      email: 'walkin@example.com',
      phoneNumber: '0700123456',
      address: '123 Main Street',
      country: 'Kenya',
      status: 'active',
      loyaltyPoints: 0,
      totalSpent: 0,
      deleted: false,
      notes: 'This is a generic walk-in customer used for POS cash sales.'
    }
  });

  // Create Miscellaneous for the Order
  await prisma.miscellaneous.create({
    data: {
      order_id: order.orderId,
      base_fare: 120.0,
      discount_amount: 0,
      additional_charges: 5.0,
      tax_amount: 3.0,
      shipping_charge: 5.0,
      payment_processing_fee: 0,
      total_order_value: 133.0,
      currency_code: 'USD',
      fare_breakdown: {},
      tip_amount: 0,
      refund_amount: 0,
      other_fees: 0,
      payment_status: 'paid',
      notes: 'Order for livestock and pet feeds.'
    }
  });

  console.log('Seed data for warehouse selling animal feeds created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
