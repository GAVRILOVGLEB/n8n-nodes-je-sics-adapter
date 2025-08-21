import { SicsAction, SicsActionCategory } from '../infrastructure/types';

export class ActionRegistry {
  private actions: Map<string, SicsAction> = new Map();
  private categorizedActions: Map<SicsActionCategory, SicsAction[]> = new Map();

  constructor(initialActions: SicsAction[] = []) {
    this.registerActions(initialActions);
  }

  registerAction(action: SicsAction): void {
    this.actions.set(action.id, action);
    this.updateCategorizedActions(action);
  }

  registerActions(actions: SicsAction[]): void {
    actions.forEach(action => this.registerAction(action));
  }

  getAction(actionId: string): SicsAction | undefined {
    return this.actions.get(actionId);
  }

  getAllActions(): SicsAction[] {
    return Array.from(this.actions.values());
  }

  getActionsByCategory(category: SicsActionCategory): SicsAction[] {
    return this.categorizedActions.get(category) || [];
  }

  getActionsByTeam(teamId: string): SicsAction[] {
    return this.getAllActions().filter(action => 
      action.team === teamId || !action.team
    );
  }

  searchActions(query: string): SicsAction[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllActions().filter(action =>
      action.name.toLowerCase().includes(lowercaseQuery) ||
      action.description.toLowerCase().includes(lowercaseQuery) ||
      action.id.toLowerCase().includes(lowercaseQuery)
    );
  }

  removeAction(actionId: string): boolean {
    const action = this.actions.get(actionId);
    if (action) {
      this.actions.delete(actionId);
      this.removeCategorizedAction(action);
      return true;
    }
    return false;
  }

  updateAction(actionId: string, updates: Partial<SicsAction>): boolean {
    const existingAction = this.actions.get(actionId);
    if (!existingAction) {
      return false;
    }

    this.removeCategorizedAction(existingAction);
    
    const updatedAction = { ...existingAction, ...updates };
    this.actions.set(actionId, updatedAction);
    this.updateCategorizedActions(updatedAction);
    
    return true;
  }

  getActionCount(): number {
    return this.actions.size;
  }

  getCategories(): SicsActionCategory[] {
    return Array.from(this.categorizedActions.keys());
  }

  clear(): void {
    this.actions.clear();
    this.categorizedActions.clear();
  }

  private updateCategorizedActions(action: SicsAction): void {
    if (!this.categorizedActions.has(action.category)) {
      this.categorizedActions.set(action.category, []);
    }
    
    const categoryActions = this.categorizedActions.get(action.category)!;
    const existingIndex = categoryActions.findIndex(a => a.id === action.id);
    
    if (existingIndex >= 0) {
      categoryActions[existingIndex] = action;
    } else {
      categoryActions.push(action);
    }
  }

  private removeCategorizedAction(action: SicsAction): void {
    const categoryActions = this.categorizedActions.get(action.category);
    if (categoryActions) {
      const index = categoryActions.findIndex(a => a.id === action.id);
      if (index >= 0) {
        categoryActions.splice(index, 1);
        
        if (categoryActions.length === 0) {
          this.categorizedActions.delete(action.category);
        }
      }
    }
  }

  exportActions(): SicsAction[] {
    return this.getAllActions();
  }

  importActions(actions: SicsAction[], replace: boolean = false): void {
    if (replace) {
      this.clear();
    }
    this.registerActions(actions);
  }
}
