import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  HostBinding,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { MultiTabsService } from "../services/multi-tabs.service";
import type { MultiTabItem, MultiTabsTheme } from "../types";

@Component({
  selector: "drm-multi-tabs",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="drm-multitabs__shell">
      <!-- Launcher -->
      <button
        class="drm-multitabs__launcher"
        type="button"
        aria-label="Navigation launcher"
      >
        <ng-content select="[slot=launcher-icon]">
          <span>⊞</span>
        </ng-content>
      </button>

      <!-- Tab rail -->
      <div class="drm-multitabs__rail" role="tablist" aria-label="Open tabs">
        <div
          *ngFor="let tab of tabs"
          class="drm-multitabs__tab-group"
          [class.drm-multitabs__tab-group--drag-over]="dragOverTabId === tab.id"
          draggable="true"
          (dragstart)="onDragStart(tab, $event)"
          (dragover)="onDragOver(tab, $event)"
          (drop)="onDrop(tab, $event)"
          (dragend)="onDragEnd()"
          (contextmenu)="onTabContextMenu(tab.id, $event)"
        >
          <div class="drm-multitabs__tab-shell">
            <!-- Tab button -->
            <button
              class="drm-multitabs__tab"
              [class.drm-multitabs__tab--active]="tab.id === currentTabId"
              type="button"
              role="tab"
              [attr.aria-selected]="tab.id === currentTabId"
              [title]="
                tab.caseNumber && tab.caseTitle
                  ? '[' + tab.caseNumber + '] - ' + tab.caseTitle
                  : tab.title
              "
              (click)="onTabClick(tab)"
            >
              <span class="drm-multitabs__tab-icon" aria-hidden="true">{{
                tab.icon
              }}</span>

              <ng-container
                *ngIf="tab.caseNumber && tab.caseTitle; else regularLabel"
              >
                <span class="drm-multitabs__tab-case-number"
                  >[{{ tab.caseNumber }}]</span
                >
                <span class="drm-multitabs__tab-case-title">{{
                  tab.caseTitle
                }}</span>
              </ng-container>
              <ng-template #regularLabel>
                <span class="drm-multitabs__tab-label">{{ tab.title }}</span>
              </ng-template>
            </button>

            <!-- Context menu -->
            <div
              *ngIf="activeTabMenuId === tab.id"
              class="drm-multitabs__menu-card drm-multitabs__context-menu"
              role="menu"
              (click)="$event.stopPropagation()"
            >
              <button
                class="drm-multitabs__menu-item"
                type="button"
                role="menuitem"
                (click)="onReloadTab(tab)"
              >
                ↺ Reload Tab
              </button>
              <button
                class="drm-multitabs__menu-item drm-multitabs__menu-item--danger"
                type="button"
                role="menuitem"
                (click)="onCloseTab(tab)"
              >
                ✕ Close Tab
              </button>
            </div>

            <!-- Close button -->
            <button
              class="drm-multitabs__close"
              type="button"
              [attr.aria-label]="'Close ' + tab.title"
              (click)="$event.stopPropagation(); onCloseTab(tab)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Dropdown -->
      <div style="position: relative; flex-shrink: 0">
        <button
          class="drm-multitabs__dropdown"
          type="button"
          aria-label="All tabs"
          [attr.aria-expanded]="dropdownOpen"
          (click)="dropdownOpen = !dropdownOpen"
        >
          ▾
        </button>

        <div
          *ngIf="dropdownOpen"
          class="drm-multitabs__menu-card"
          role="menu"
          style="position: absolute; top: calc(100% + 4px); right: 0; z-index: 100; min-width: 160px"
          (click)="$event.stopPropagation()"
        >
          <button
            *ngFor="let tab of tabs"
            class="drm-multitabs__menu-item"
            [class.drm-multitabs__menu-item--active]="tab.id === currentTabId"
            type="button"
            role="menuitem"
            (click)="closeAllMenus(); service.openTab(tab)"
          >
            {{
              tab.caseNumber
                ? "[" + tab.caseNumber + "] " + tab.caseTitle
                : tab.title
            }}
          </button>

          <hr
            style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 4px 0"
          />

          <button
            class="drm-multitabs__menu-item drm-multitabs__menu-item--danger"
            type="button"
            role="menuitem"
            (click)="onCloseAllTabs()"
          >
            ✕ Close All Tabs
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <div
      *ngIf="activeTabMenuId !== null || dropdownOpen"
      style="position: fixed; inset: 0; z-index: 99"
      (click)="closeAllMenus()"
    ></div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: sticky;
        top: 0;
        z-index: var(--drm-tabs-z-index, 8);
        width: 100%;
        height: var(--drm-tabs-height, 40px);
        background: var(--drm-tabs-shell-bg, rgba(255, 255, 255, 0.8));
        border-bottom: var(
          --drm-tabs-shell-border,
          1px solid rgba(0, 0, 0, 0.08)
        );
        backdrop-filter: var(--drm-tabs-shell-backdrop, blur(16px));
      }

      .drm-multitabs__context-menu {
        position: absolute;
        left: 0;
        top: calc(100% + 4px);
        z-index: 100;
      }

      .drm-multitabs__menu-item--active {
        font-weight: 600;
      }
    `,
  ],
})
export class MultiTabsComponent implements OnInit, OnDestroy {
  @Input() theme?: MultiTabsTheme;

  readonly service = inject(MultiTabsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private sub?: Subscription;

  tabs: MultiTabItem[] = [];
  activeTabMenuId: string | null = null;
  dragOverTabId: string | null = null;
  dropdownOpen = false;
  private draggingTabId: string | null = null;

  get currentTabId(): string {
    return this.service.currentTabId;
  }

  @HostBinding("style")
  get hostStyle(): Record<string, string> {
    if (!this.theme) return {};
    const map: Record<keyof MultiTabsTheme, string> = {
      height: "--drm-tabs-height",
      shellBg: "--drm-tabs-shell-bg",
      tabBg: "--drm-tabs-tab-bg",
      tabColor: "--drm-tabs-tab-color",
      activeTabBg: "--drm-tabs-active-bg",
      activeTabColor: "--drm-tabs-active-color",
      activeTabBorderColor: "--drm-tabs-active-border-color",
      borderRadius: "--drm-tabs-border-radius",
      fontSize: "--drm-tabs-font-size",
      tabMaxWidth: "--drm-tabs-tab-max-width",
      tabMinWidth: "--drm-tabs-tab-min-width",
      closeHoverColor: "--drm-tabs-close-hover-color",
      dragOverColor: "--drm-tabs-drag-over-border",
    };
    const result: Record<string, string> = {};
    for (const [key, cssVar] of Object.entries(map)) {
      const val = this.theme[key as keyof MultiTabsTheme];
      if (val !== undefined) result[cssVar] = val;
    }
    return result;
  }

  ngOnInit(): void {
    this.sub = this.service.tabs$.subscribe((tabs) => {
      this.tabs = tabs;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  closeAllMenus(): void {
    this.activeTabMenuId = null;
    this.dropdownOpen = false;
  }

  onTabClick(tab: MultiTabItem): void {
    this.closeAllMenus();
    this.service.openTab(tab);
  }

  onCloseTab(tab: MultiTabItem): void {
    if (this.activeTabMenuId === tab.id) this.activeTabMenuId = null;
    this.service.closeTab(tab);
  }

  onCloseAllTabs(): void {
    this.closeAllMenus();
    this.service.closeAllTabs();
  }

  onReloadTab(tab: MultiTabItem): void {
    this.closeAllMenus();
    this.service.reloadTab(tab);
  }

  onTabContextMenu(tabId: string, event: MouseEvent): void {
    event.preventDefault();
    this.dropdownOpen = false;
    this.activeTabMenuId = this.activeTabMenuId === tabId ? null : tabId;
  }

  onDragStart(tab: MultiTabItem, event: DragEvent): void {
    this.draggingTabId = tab.id;
    event.dataTransfer?.setData("text/plain", tab.id);
  }

  onDragOver(tab: MultiTabItem, event: DragEvent): void {
    event.preventDefault();
    if (this.draggingTabId && this.draggingTabId !== tab.id) {
      this.dragOverTabId = tab.id;
    }
  }

  onDrop(tab: MultiTabItem, event: DragEvent): void {
    event.preventDefault();
    const sourceId = event.dataTransfer?.getData("text/plain");
    if (sourceId && sourceId !== tab.id) this.service.moveTab(sourceId, tab.id);
    this.dragOverTabId = null;
  }

  onDragEnd(): void {
    this.draggingTabId = null;
    this.dragOverTabId = null;
  }
}
