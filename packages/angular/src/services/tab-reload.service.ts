import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * Module-level singleton for tab reload nonces.
 * Provides a BehaviorSubject per tabId that emits incrementing nonces.
 */
@Injectable({ providedIn: "root" })
export class TabReloadService {
  private readonly nonces = new Map<string, BehaviorSubject<number>>();

  /**
   * Get the BehaviorSubject for a tab's reload nonce.
   * Subscribe to it to react when a tab is reloaded.
   */
  getNonce$(tabId: string): BehaviorSubject<number> {
    if (!this.nonces.has(tabId)) {
      this.nonces.set(tabId, new BehaviorSubject<number>(0));
    }
    return this.nonces.get(tabId)!;
  }

  /**
   * Increment the reload nonce for a given tab.
   * Called by MultiTabsService when reloadTab() is triggered.
   */
  bump(tabId: string): void {
    const subject = this.getNonce$(tabId);
    subject.next(subject.value + 1);
  }
}
