/**
 * Operation type definition
 */
export interface Operation {
    id: string;           // Unique operation identifier
    description: string;  // Operation description
    type: string;         // Operation type
    completed: boolean;   // Whether completed
    timestamp?: number;   // Completion timestamp
    parameters?: any;     // Operation parameters
}

/**
 * Operation Tracking Service
 * Used to track and manage the execution status of a series of operations
 */
export class OperationTrackerService {
    private static instance: OperationTrackerService;
    private operations: Operation[] = [];
    private taskDescription = '';
    
    /**
     * Get singleton instance
     */
    public static getInstance(): OperationTrackerService {
        if (!OperationTrackerService.instance) {
            OperationTrackerService.instance = new OperationTrackerService();
        }
        return OperationTrackerService.instance;
    }
    
    /**
     * Initialize new task
     * @param taskDescription Task description
     * @param operations Operation list
     */
    public initializeTask(taskDescription: string, operations: Omit<Operation, 'completed' | 'id' | 'timestamp'>[]): void {
        this.taskDescription = taskDescription;
        this.operations = operations.map((op, index) => ({
            ...op,
            id: `op-${Date.now()}-${index}`,
            completed: false
        }));
        
        console.log(`Task initialized: ${taskDescription}, with ${this.operations.length} operations`);
    }
    
    /**
     * Mark operation as completed
     * @param operationId Operation ID
     */
    public markOperationCompleted(operationId: string): void {
        const operationIndex = this.operations.findIndex(op => op.id === operationId);
        if (operationIndex !== -1) {
            this.operations[operationIndex].completed = true;
            this.operations[operationIndex].timestamp = Date.now();
            console.log(`Operation completed: ${this.operations[operationIndex].description}`);
        } else {
            console.warn(`Operation ID not found: ${operationId}`);
        }
    }
    
    /**
     * Mark operation at specified index as completed
     * @param index Operation index
     */
    public markOperationCompletedByIndex(index: number): void {
        if (index >= 0 && index < this.operations.length) {
            this.operations[index].completed = true;
            this.operations[index].timestamp = Date.now();
            console.log(`Operation completed: ${this.operations[index].description}`);
        } else {
            console.warn(`Operation index out of range: ${index}`);
        }
    }
    
    /**
     * Get all operations
     */
    public getAllOperations(): Operation[] {
        return [...this.operations];
    }
    
    /**
     * Get completed operations
     */
    public getCompletedOperations(): Operation[] {
        return this.operations.filter(op => op.completed);
    }
    
    /**
     * Get pending operations
     */
    public getPendingOperations(): Operation[] {
        return this.operations.filter(op => !op.completed);
    }
    
    /**
     * Get task and operation status summary
     */
    public getTaskSummary(): string {
        const completedCount = this.getCompletedOperations().length;
        const totalCount = this.operations.length;
        
        let summary = `Task: ${this.taskDescription}\n`;
        summary += `Progress: ${completedCount}/${totalCount}\n\n`;
        
        if (completedCount > 0) {
            summary += "Completed operations:\n";
            this.getCompletedOperations().forEach((op, index) => {
                summary += `${index + 1}. ${op.description}\n`;
            });
            summary += "\n";
        }
        
        if (completedCount < totalCount) {
            summary += "Pending operations:\n";
            this.getPendingOperations().forEach((op, index) => {
                summary += `${index + 1}. ${op.description}\n`;
            });
        }
        
        return summary;
    }
    
    /**
     * Reset current task
     */
    public resetTask(): void {
        this.taskDescription = '';
        this.operations = [];
        console.log('Task and operation tracking reset');
    }
    
    /**
     * Add new operation
     * @param operation New operation
     */
    public addOperation(operation: Omit<Operation, 'completed' | 'id' | 'timestamp'>): string {
        const newOperation: Operation = {
            ...operation,
            id: `op-${Date.now()}-${this.operations.length}`,
            completed: false
        };
        
        this.operations.push(newOperation);
        console.log(`New operation added: ${newOperation.description}`);
        return newOperation.id;
    }
    
    /**
     * Check if task is completed
     */
    public isTaskCompleted(): boolean {
        return this.operations.length > 0 && this.operations.every(op => op.completed);
    }
} 