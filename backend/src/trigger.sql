  -- Drop the function if it already exists


    -- Create the function to log stock changes
    CREATE OR REPLACE FUNCTION log_inventory_sales_tracker()
    RETURNS TRIGGER AS $$
    BEGIN 
      INSERT INTO "InventorySalesTracking"(
        "inventoryId", 
        "new_stock_quantity", 
        "old_stock_quantity", 
        "reorder_level", 
        "restock_date", 
        "softDelete"
      )
      VALUES (
        NEW.inventoryId,
        NEW.stock_quantity,  -- New stock quantity
        OLD.stock_quantity,  -- Old stock quantity
        NEW.reorder_level,
        CURRENT_TIMESTAMP,  -- Use current timestamp as restock_date
        NEW.softDelete
      );

      -- Return the new record to apply the update to the Inventory table
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create the trigger that fires the function after each update on Inventory
    CREATE TRIGGER inventory_stock_update
    AFTER UPDATE ON "Inventory"
    FOR EACH ROW
    EXECUTE FUNCTION log_inventory_sales_tracker();