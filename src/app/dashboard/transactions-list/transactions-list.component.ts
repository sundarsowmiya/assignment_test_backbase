import { Component, Input } from '@angular/core';
import { Merchant, TransactionData } from '../../shared/models/transaction-data.model';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss']
})
export class TransactionsListComponent {
  @Input() transactionsList: TransactionData[];
  @Input() merchants: Merchant[];
  searchText: string;
  filterCategory: string[] = ['merchant'];
}
