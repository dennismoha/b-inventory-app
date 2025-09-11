sequenceDiagram
    participant Supplier
    participant System
    participant Purchase
    participant BatchInventory
    participant InventoryStock
    participant Sales
    participant BatchHistory
    participant BatchPayables

    Supplier->>System: Deliver Goods
    System->>Purchase: Record purchase (qty, damages, costs)
    Purchase->>BatchInventory: Create new batch (stock = undamaged qty)

    alt Admin activates batch
        BatchInventory->>InventoryStock: Create / Update stock
    else Auto-activate (when prev batch finished)
        BatchInventory->>InventoryStock: Auto set ACTIVE
    end

    Sales->>InventoryStock: Sell item (reduce stock)
    InventoryStock->>BatchInventory: Update sold_quantity
    InventoryStock->>Sales: Record sale transaction

    alt Stock Depleted
        InventoryStock->>BatchInventory: Mark FINISHED
        BatchInventory->>BatchHistory: Log history
        System->>BatchInventory: Activate next batch
    end

    alt Purchase not fully paid
        Purchase->>BatchPayables: Record balance due
        BatchPayables->>System: Track until settled
    end
