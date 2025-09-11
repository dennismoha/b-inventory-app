import { Client } from 'pg';

// Set up PostgreSQL client
const client = new Client({
  user: 'postgres',
  host: 'localhost', // or your DB host
  database: 'b-inventory-management-system',
  password: 'postgres',
  port: 5432 // default port
});

async function createTriggers() {
  const triggerSQL = `
     CREATE OR REPLACE FUNCTION log_inventory_sales_tracking()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Insert the new stock value (after the update)
    -- Insert the new stock value (after the update)
  INSERT INTO "InventorySalesTracking"(
  	"inventorysalesTrackingId",
    "inventoryId", 
    "new_stock_quantity", 
    "old_stock_quantity", 
    "reorder_level", 
    "restock_date", 
    "softDelete"
  )
  VALUES (
    uuid_generate_v4(),
    NEW."inventoryId",
    NEW."stock_quantity",  -- New stock quantity
    OLD."stock_quantity",  -- Old stock quantity
    NEW."reorder_level",
    CURRENT_TIMESTAMP,  -- Use current timestamp as restock_date
    NEW."softDelete"
  );


      -- Return the new record to apply the update to the Inventory table
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    // Connect to the PostgreSQL database
    await client.connect();

    // Run the raw SQL query to create the triggers
    await client.query(triggerSQL);

    console.log('Triggers created successfully');
  } catch (err) {
    console.error('Error creating triggers:', err);
  } finally {
    // Disconnect from the PostgreSQL database
    await client.end();
  }
}

createTriggers();
