# flow for sell

flowchart TD
    A[User logs in] --> B[User is presented with Products]

    B --> C[Click on a product]
    C --> D[Add 1 unit to cart]
    D --> E{Is stock_quantity sufficient?}
    E -- No --> F[Show error: Not enough stock]
    E -- Yes --> G{Is product priced?}
    G -- No --> H[Show error: Product not priced]
    G -- Yes --> I[Add to order section & increase total payable]

    I --> J[User can increase quantity in cart]
    J --> K{Is stock still sufficient?}
    K -- No --> F
    K -- Yes --> I

    I --> L[User selects customer]
    L --> M{Customer selected?}
    M -- No --> N[Show error: No customer selected]
    M -- Yes --> O[Proceed to payment options]

    O --> P[Select payment method Cash, Card, etc.]
    P --> Q{Is Card selected?}
    Q -- Yes --> R[Show input for payment reference ID]
    Q -- No --> S[Skip card details]

    R & S --> T[User clicks on Pay]

    T --> U[Show confirmation modal]
    U --> V{Confirm details correct?}
    V -- No --> W[Cancel and return to edit]
    V -- Yes --> X[Send order to backend]



flowchart TD
    Login[User logs in] --> ShowItems[Show available products]

    ShowItems --> ClickProduct[User clicks on a product]
    ClickProduct --> CheckStock{Stock > 0?}
    CheckStock -- No --> ErrorStock[Show error: Stock too low]
    CheckStock -- Yes --> CheckPrice{Is product priced?}
    CheckPrice -- No --> ErrorPrice[Show error: Product not priced]
    CheckPrice -- Yes --> AddToCart[Add 1 unit to cart]

    AddToCart --> UpdateTotal[Update total payable]
    AddToCart --> IncreaseQty[User increases quantity manually]
    IncreaseQty --> CheckStock

    AddToCart --> CustomerSelect[User selects customer]
    CustomerSelect --> CheckCustomer{Customer selected?}
    CheckCustomer -- No --> ErrorCustomer[Show error: No customer selected]
    CheckCustomer -- Yes --> ChoosePayment[User selects payment method]

    ChoosePayment --> IsCard{Payment method is Card?}
    IsCard -- Yes --> ShowCardFields[Show card reference input]
    IsCard -- No --> SkipCard[Skip card input]

    ShowCardFields --> ConfirmSale
    SkipCard --> ConfirmSale

    ConfirmSale[User clicks Pay] --> ShowModal[Show confirmation modal]
    ShowModal --> ConfirmChoice{Confirm details correct?}
    ConfirmChoice -- No --> ReturnEdit[Return to edit]
    ConfirmChoice -- Yes --> SubmitBackend[Send order to backend]
