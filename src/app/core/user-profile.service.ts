import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserAccount } from '../shared/models/user-account.model';
import userDetails from './mock-data/mock-user-data';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private accountDetails = { ...userDetails };

  private accountDetailsSubject$: BehaviorSubject<UserAccount> = new BehaviorSubject(this.accountDetails);

  getUserAccountDetails(): Observable<UserAccount> {
    return this.accountDetailsSubject$.asObservable();
  }

  deductBalance(amount: number): void {
    const remainingBalance = this.accountDetails.balance - amount;
    this.accountDetails = { ...this.accountDetails, ...{ balance: remainingBalance } };
    this.accountDetailsSubject$.next(this.accountDetails);
  }
}
