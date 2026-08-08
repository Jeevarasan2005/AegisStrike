print("===== PAYMENT GATEWAY =====")

name = input("Enter Customer Name: ")
amount = float(input("Enter Amount to Pay: ₹"))

print("\nSelect Payment Method")
print("1. UPI")
print("2. Debit Card")
print("3. Credit Card")

choice = int(input("Enter Choice (1-3): "))

if amount <= 0:
    print("Invalid Amount!")
else:
    if choice == 1:
        upi_id = input("Enter UPI ID: ")
        print("\nProcessing UPI Payment...")
        print("Payment Successful!")
        
    elif choice == 2:
        card_no = input("Enter Debit Card Number: ")
        print("\nProcessing Debit Card Payment...")
        print("Payment Successful!")
        
    elif choice == 3:
        card_no = input("Enter Credit Card Number: ")
        print("\nProcessing Credit Card Payment...")
        print("Payment Successful!")
        
    else:
        print("Invalid Payment Method!")
    
    print("\n----- RECEIPT -----")
    print("Customer:", name)
    print("Amount Paid: ₹", amount)
    print("Status: SUCCESS")