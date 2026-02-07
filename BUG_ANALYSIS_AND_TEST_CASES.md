# Bug Analysis & Test Cases for Transaction Management

---

## 🐛 BUGS FOUND

### **BUG #1: Amount Input Accepts Decimal Values (Parse Error)**
**Location:** `add-transaction-dialogue.ts` & `edit-transaction-dialog.ts` → `onAmountInput()`
**Severity:** HIGH

```typescript
const numericValue = parseInt(input, 10); // ❌ IGNORES DECIMALS
```

**Issue:** Using `parseInt()` truncates decimal values (e.g., 1000.50 becomes 1000). This causes incorrect amount storage and balance calculation.

**Fix:** Use `parseFloat()` instead:
```typescript
const numericValue = parseFloat(input);
```

---

### **BUG #2: Product Field Name Mismatch in Create Flow**
**Location:** `add-transaction-dialogue.ts` → `onSave()`
**Severity:** HIGH

```typescript
// Form control is named "products" (array)
products: [[], Validators.required]

// But backend might expect single "product" field
// Current code sends: products: [selected_values]
// Backend expects: product: "string" OR products: ["item1", "item2"]
```

**Issue:** Inconsistency between single vs. multi-select handling. If backend expects product name string, this fails.

---

### **BUG #3: Missing Amount Field Binding in Add Dialog**
**Location:** `add-transaction-dialogue.html`
**Severity:** HIGH

```html
<!-- Form control: amount (initialized as 0) -->
<input type="text" class="form-control" 
       [value]="formattedAmount" 
       (input)="onAmountInput($event)" 
       placeholder="Enter amount" required/>
<!-- ❌ NO formControlName="amount" binding! -->
```

**Issue:** Amount input field is not bound to the form control. The value updates `formattedAmount` visually but the actual form control may not update properly, causing validation issues.

**Fix:**
```html
<input type="text" class="form-control" 
       formControlName="amount"
       [value]="formattedAmount" 
       (input)="onAmountInput($event)" 
       placeholder="Enter amount" required/>
```

---

### **BUG #4: Transaction Balance Not Recalculated on Update**
**Location:** `edit-transaction-dialog.ts` → `onUpdate()`
**Severity:** CRITICAL

```typescript
onUpdate(): void {
  if (this.transactionForm.valid) {
    const transactionData = {
      txDate: ...,
      product: ...,
      amount: this.transactionForm.value.amount,
      // ❌ MISSING: Balance is not recalculated on the backend
      // If a past transaction is edited, all subsequent balances become incorrect
    };
```

**Issue:** When editing an existing transaction, the balance of that transaction and all subsequent transactions should be recalculated. Without this, the running balance becomes incorrect.

**Fix:** Backend should handle automatic balance recalculation when transaction amount changes.

---

### **BUG #5: Delete Action Doesn't Trigger Balance Recalculation**
**Location:** `transaction.ts` → `deleteCurrentTxn()`
**Severity:** CRITICAL

```typescript
deleteCurrentTxn(txn: Transaction): void {
  // Transaction is deleted
  // ✅ Frontend refetches updated data (OK)
  // ❌ But if balance wasn't recalculated server-side, 
  //    all subsequent transactions show wrong balance
```

**Issue:** Backend must recalculate balance for all subsequent transactions when one is deleted.

---

### **BUG #6: Amount Formatting Doesn't Handle Edge Cases**
**Location:** `add-transaction-dialogue.ts` & `edit-transaction-dialog.ts` → `formatIndianRupee()`
**Severity:** MEDIUM

```typescript
formatIndianRupee(value: number): string {
  const x = value.toString();
  const lastThree = x.substring(x.length - 3);
  const otherNumbers = x.substring(0, x.length - 3);
  // ❌ Fails for:
  // - Zero: "0" → lastThree="0", otherNumbers="" ✓ (actually OK)
  // - Decimal: "1000.50" → lastThree=".50", otherNumbers="100" ✗ (broken)
  // - Negative: "-5000" → formatting breaks
```

**Fix:**
```typescript
formatIndianRupee(value: number): string {
  return value.toLocaleString('en-IN', { 
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
```

---

### **BUG #7: Multiple Products Not Handled in Display**
**Location:** `transaction.html`
**Severity:** MEDIUM

```html
<td>{{ txn.product }}</td>
<!-- ❌ Only displays single product field
     If backend stores multiple products in array, only first shows -->
```

**Fix:**
```html
<td>
  <span *ngIf="txn.product">{{ txn.product }}</span>
  <span *ngIf="txn.products">
    {{ txn.products.join(', ') }}
  </span>
</td>
```

---

### **BUG #8: Type Case Sensitivity**
**Location:** `transaction.html` & `transaction.ts`
**Severity:** LOW

```typescript
txn.type.toUpperCase() === 'CREDIT'  // OK
// ❌ But if backend returns 'Credit' or 'credit', this breaks
```

**Fix:** Always normalize to uppercase or lowercase throughout.

---

## ✅ TEST CASES

### **Test Suite 1: CREATE Transaction**

#### TC1.1: Create transaction with valid inputs
**Steps:**
1. Select Party
2. Click "Add Transaction"
3. Fill: Date (today), Products (SAFOLITE), Type (CREDIT), Amount (1000)
4. Click "Save Transaction"

**Expected:**
- Transaction created with balance updated
- No validation errors
- Balance recalculated from party's previous balance

**Bug Check:** Amount = 1000 (check no truncation)

---

#### TC1.2: Create transaction with decimal amount
**Steps:**
1. Fill amount as "5000.75"
2. Save

**Expected:**
- Amount saved as 5000.75 (not 5000) ✓
- Balance calculation includes decimal

**Current Status:** ❌ FAILS (parseInt truncates)

---

#### TC1.3: Create transaction with negative amount (edge case)
**Steps:**
1. Fill amount as "-1000"
2. Save

**Expected:**
- Either rejected or handled gracefully
- Amount formatting doesn't break

**Current Status:** ⚠️ NEEDS TEST

---

#### TC1.4: Create without selecting product
**Steps:**
1. Leave Products empty
2. Try to save

**Expected:**
- Validation error: "Products required"
- Save button disabled

**Current Status:** Should ✅ PASS (validator present)

---

#### TC1.5: Create without amount
**Steps:**
1. Leave Amount empty
2. Try to save

**Expected:**
- Validation error: "Amount required" or "Min value 1"
- Save button disabled

**Current Status:** Should ✅ PASS (validator: min(1))

---

#### TC1.6: Create with amount = 0
**Steps:**
1. Enter amount "0"
2. Try to save

**Expected:**
- Validation error (min value 1)
- Button disabled

**Current Status:** Should ✅ PASS

---

#### TC1.7: Create transaction with DEBIT type
**Steps:**
1. Select Type = DEBIT
2. Amount = 5000
3. Previous balance = 10000
4. Save

**Expected:**
- New balance = 10000 - 5000 = 5000
- Amount displayed as positive ₹5000 (Math.abs applied)
- Type icon shows ⬆️

**Current Status:** ✅ Should PASS (Math.abs in display)

---

#### TC1.8: Create multiple transactions and verify running balance
**Steps:**
1. Party Initial Balance = 0
2. Create CREDIT 1000 → Expected Balance = 1000
3. Create CREDIT 2000 → Expected Balance = 3000
4. Create DEBIT 500 → Expected Balance = 2500
5. Create DEBIT 1000 → Expected Balance = 1500

**Expected:**
- Each transaction's balance reflects running total

**Current Status:** ❌ POTENTIAL BUG (backend calculation not verified)

---

### **Test Suite 2: UPDATE Transaction**

#### TC2.1: Edit amount of existing transaction
**Steps:**
1. Select a past transaction (TXN1: CREDIT 1000, balance after = 5000)
2. Edit: Change amount from 1000 → 2000
3. Save

**Expected:**
- TXN1 amount = 2000
- Balance of TXN1 = previous + 2000
- **All subsequent transaction balances recalculated**

**Current Status:** ❌ FAILS (Backend must recalculate, frontend doesn't enforce)

---

#### TC2.2: Edit product of transaction
**Steps:**
1. Edit transaction
2. Change product from SAFOLITE → BICARBONATE
3. Save

**Expected:**
- Product updated
- Backend receives: `{ product: "BICARBONATE", products: ["BICARBONATE"], ... }`

**Current Status:** ⚠️ NEEDS VERIFICATION (field name mismatch issue)

---

#### TC2.3: Edit type from CREDIT to DEBIT
**Steps:**
1. TXN: CREDIT 5000, balance = 5000
2. Edit: Change to DEBIT 5000
3. Save

**Expected:**
- Balance changes from credit to debit effect
- Subsequent balances recalculated: 5000 → 0 (if DEBIT) or ↓

**Current Status:** ❌ CRITICAL (recalculation not in frontend code)

---

#### TC2.4: Edit amount with decimal
**Steps:**
1. Change amount to 1500.50
2. Save

**Expected:**
- Amount saved as 1500.50

**Current Status:** ❌ FAILS (parseInt truncates)

---

#### TC2.5: Edit transaction to 0 amount
**Steps:**
1. Try to change amount to 0
2. Save

**Expected:**
- Validation prevents save (min = 1)

**Current Status:** ✅ Should PASS

---

### **Test Suite 3: DELETE Transaction**

#### TC3.1: Delete middle transaction and verify balances
**Steps:**
1. Create sequence:
   - TXN1: CREDIT 1000 → Balance 1000
   - TXN2: CREDIT 2000 → Balance 3000
   - TXN3: CREDIT 1000 → Balance 4000
2. Delete TXN2
3. Refresh list

**Expected:**
- TXN2 removed
- TXN3 balance should now be 2000 (only TXN1 + TXN3)
- NOT 4000 (previous incorrect balance)

**Current Status:** ❌ CRITICAL BUG (No balance recalculation in delete)

---

#### TC3.2: Delete first transaction
**Steps:**
1. TXN1: CREDIT 1000 → Balance 1000
2. TXN2: CREDIT 2000 → Balance 3000
3. Delete TXN1

**Expected:**
- TXN1 removed
- TXN2 balance = 2000 (only its own credit)

**Current Status:** ❌ CRITICAL BUG

---

#### TC3.3: Delete all transactions for party
**Steps:**
1. Delete all transactions one by one
2. Verify party balance = 0

**Expected:**
- No transactions shown
- Party balance reset to initial (0 or whatever backend stores)

**Current Status:** Depends on backend

---

#### TC3.4: Delete and undo (if feature exists)
**Steps:**
1. Delete transaction
2. Check if undo exists

**Expected:**
- Either undo button OR clear warning

**Current Status:** ⚠️ No undo feature visible, requires confirmation

---

### **Test Suite 4: Balance Calculation**

#### TC4.1: Calculate running balance with CREDIT only
**Steps:**
1. Clear all transactions
2. CREDIT 1000 → Expected: 1000
3. CREDIT 2000 → Expected: 3000
4. CREDIT 500 → Expected: 3500

**Expected:** Running total = 1000 + 2000 + 500 = 3500

---

#### TC4.2: Calculate running balance with DEBIT only
**Steps:**
1. Starting balance = 10000 (initial party balance)
2. DEBIT 2000 → Expected: 8000
3. DEBIT 3000 → Expected: 5000
4. DEBIT 1000 → Expected: 4000

**Expected:** Running balance decreases

---

#### TC4.3: Mixed CREDIT and DEBIT
**Steps:**
1. Initial = 0
2. CREDIT 5000 → 5000
3. DEBIT 2000 → 3000
4. CREDIT 1500 → 4500
5. DEBIT 500 → 4000

**Expected:** Balance = 5000 - 2000 + 1500 - 500 = 4000

---

#### TC4.4: Balance precision with decimals
**Steps:**
1. CREDIT 1000.50 → 1000.50
2. DEBIT 250.25 → 750.25
3. CREDIT 99.99 → 850.24

**Expected:** All decimals preserved, no rounding errors

**Current Status:** ❌ FAILS (parseInt removes decimals)

---

### **Test Suite 5: Form Validation**

#### TC5.1: Submit form with all fields empty
**Expected:** Save button disabled

---

#### TC5.2: Submit with only Date filled
**Expected:** Save button disabled

---

#### TC5.3: Amount field UI behavior
**Steps:**
1. Type "1000"
2. Check displayed value
3. Clear and type "1000.50"
4. Check displayed value

**Expected:**
- Display formatted: 1,000 or 1,000.50
- Form control value: 1000 or 1000.50

**Current Status:** ❌ FAILS (No formControlName on amount input in add-dialogue)

---

### **Test Suite 6: Data Binding Issues**

#### TC6.1: Create transaction with multiple products selected
**Steps:**
1. Select products: SAFOLITE, BICARBONATE, RB
2. Save

**Expected:**
- Backend receives: `products: ["SAFOLITE", "BICARBONATE", "RB"]`
- Transaction shows all products

**Current Status:** ⚠️ Only `txn.product` displayed in table (partial support)

---

---

## 🔧 RECOMMENDED FIXES (Priority Order)

### **CRITICAL (Fix Immediately)**
1. **Fix `parseInt()` → `parseFloat()`** in both dialogs
2. **Fix amount input binding** in add-transaction-dialogue.html (add `formControlName="amount"`)
3. **Implement backend balance recalculation** on update/delete

### **HIGH (Fix Soon)**
4. Fix product field name consistency (product vs. products)
5. Fix `formatIndianRupee()` to handle decimals
6. Add balance recalculation to subsequent transactions after edit

### **MEDIUM (Fix Next Sprint)**
7. Handle multiple products display in transaction table
8. Normalize type case sensitivity
9. Add decimal support throughout

---

## 📝 Summary Table

| Bug # | Component | Issue | Severity | Test Case |
|-------|-----------|-------|----------|-----------|
| 1 | Amount Input | parseInt truncates decimals | 🔴 HIGH | TC1.2, TC2.4, TC4.4 |
| 2 | Product Field | Field name mismatch | 🔴 HIGH | TC2.2, TC6.1 |
| 3 | Add Dialog HTML | Missing formControlName | 🔴 HIGH | TC5.3, TC1.1 |
| 4 | Edit Dialog | No balance recalc | 🔴 CRITICAL | TC2.1, TC2.3 |
| 5 | Delete | No balance recalc | 🔴 CRITICAL | TC3.1, TC3.2 |
| 6 | Amount Format | Edge cases broken | 🟡 MEDIUM | TC4.4 |
| 7 | Display | Multiple products | 🟡 MEDIUM | TC6.1 |
| 8 | Type | Case sensitivity | 🟢 LOW | TC1.7 |

---

## 🚀 Next Steps
1. Run all test cases against current code
2. Apply fixes in priority order
3. Create backend tests for balance recalculation logic
4. Add unit tests for amount formatting and validation
