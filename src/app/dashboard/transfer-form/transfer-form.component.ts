import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserAccount } from '../../shared/models/user-account.model';
import { TransactionFormData } from '../../shared/models/transaction-form-data.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Merchant } from '../../shared/models/transaction-data.model';
import { MatSnackBar } from '@angular/material/snack-bar';

interface InputError {
  [key: string]: boolean;
}

@Component({
  selector: 'app-transfer-form',
  templateUrl: './transfer-form.component.html',
  styleUrls: ['./transfer-form.component.scss']
})
export class TransferFormComponent implements OnChanges {
  transferForm: FormGroup = new FormGroup({});
  modelChanged: Subject<string> = new Subject<string>();
  filteredMerchants: Merchant[] = [];
  showMerchantOptions: boolean;
  @Input() merchants: Merchant[];
  @Input() userAccount: UserAccount;
  @Output() performTransaction = new EventEmitter<TransactionFormData>();

  constructor(private fb: FormBuilder,
    private readonly matSnackBar: MatSnackBar) {
    this.showMerchantOptions = false;
    this.modelChanged.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe((searchString) => {
      (searchString && this.transferForm.get('toAccount').value) ?
        this.showMerchantOptions = false :
        this.showMerchantOptions = true;
      this.filteredMerchants = this.merchants.filter(v => v.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1).slice(0, 10);
    });
  }

  get amount(): AbstractControl {
    return this.transferForm.get('amount');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.userAccount && changes.userAccount.currentValue) {
      this.initializeForm();
    }
  }

  onSubmit(): void {
    if (this.transferForm.valid) {
      const transactionData = { ...this.transferForm.value, ...{ fromAccount: this.userAccount } };
      this.performTransaction.emit(transactionData);
    } else {
      this.matSnackBar.open('Please enter proper data to submit form', '', { duration: 3000 });
      this.transferForm.markAllAsTouched();
    }
  }

  getFilteredMerchants(searchText: string): void {
    this.modelChanged.next(searchText);
  }

  setMerchant(merchant: Merchant): void {
    this.showMerchantOptions = false;
    this.transferForm.get('merchantSearch').setValue(merchant.name);
    this.transferForm.get('toAccount').setValue(merchant);
  }

  private validateAmount(): ((control: AbstractControl) => InputError) {
    return (control: AbstractControl): InputError => {
      const balance = this.userAccount.balance;
      if ((balance - control.value) < -500) {
        return { overdraft: true };
      } else if (!/^\d+(?:\.\d{0,2})?$/g.test(control.value) || control.value === 0) {
        return { invalidAmount: true };
      }
      return null;
    };
  }

  isInValidField(controlName): boolean {
    return (this.transferForm.get(controlName).touched) && this.transferForm.get(controlName).invalid;
  }

  private initializeForm(): void {
    this.transferForm = this.fb.group({
      fromAccount: [{
        value: this.fromAccountDisplayValue(),
        disabled: true
      }],
      merchantSearch: [undefined, Validators.required],
      toAccount: [undefined, Validators.required],
      amount: [undefined, [Validators.required, this.validateAmount()]]
    });
  }

  getErrorMessage(controlName): string {
    if (this.transferForm.get(controlName).errors) {
      switch (Object.keys(this.transferForm.get(controlName).errors)[0]) {
        case 'required':
          return 'This field is required';
        case 'overdraft':
          return 'There is no enough balance';
        case 'invalidAmount':
          return 'Please enter valid amount';
      }
    }
    return '';
  }

  private fromAccountDisplayValue(): string {
    const userAccount = this.userAccount;
    const name = userAccount.name;
    const balance = userAccount.balance;
    const currencyCode = '$';
    return `${name}: ${currencyCode}${balance}`;
  }

}
