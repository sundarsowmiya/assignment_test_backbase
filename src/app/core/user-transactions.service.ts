import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {TransactionData} from '../shared/models/transaction-data.model';
import {TransactionFormData} from '../shared/models/transaction-form-data.model';
import mockTransactionsData from '../core/mock-data/mock-transaction-data';

const categoryCodes = mockTransactionsData.map(transaction => transaction.categoryCode);

@Injectable({
  providedIn: 'root'
})
export class UserTransactionsService {

  private mockTransactions: TransactionData[] = [...mockTransactionsData];
  private transactions$: BehaviorSubject<TransactionData[]> = new BehaviorSubject(this.mockTransactions);

  getTransactionsFromAPI(): Observable<TransactionData[]> {
    return this.transactions$.asObservable();
  }

  getUserTransactionDetails(): Observable<TransactionData[]> {
    return this.getTransactionsFromAPI();
  }

  addTransaction(transactionData: TransactionFormData): void {
    const request = this.formTransactionRequest(transactionData);
    this.mockTransactions = [request, ...this.mockTransactions];
    this.transactions$.next(this.mockTransactions);
  }

  private formTransactionRequest(transactionData: TransactionFormData): TransactionData {
    return {
      categoryCode: this.getCategoryCode(),
      dates: {
        valueDate: new Date().getTime(),
      },
      transaction: {
        amountCurrency: {
          amount: transactionData.amount as unknown as string,
          currencyCode: 'EUR'
        },
        type: 'Online Transfer',
        creditDebitIndicator: 'DBIT'
      },
      merchant: {
        name: transactionData.toAccount.name,
        accountNumber: transactionData.toAccount.accountNumber
      }
    };
  }

  private getCategoryCode(): string {
    const randomNumber = Math.round(Math.random() * categoryCodes.length);
    return categoryCodes[randomNumber];
  }
}
