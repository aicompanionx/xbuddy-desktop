import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Storage Service - For persisting data in the local file system
 */
export class StorageService {
    private storagePath: string;
    private data: Record<string, any> = {};
    private initialized = false;

    /**
     * Create a new storage service instance
     * @param storeName Name of the storage, used to create the storage file
     */
    constructor(private storeName: string) {
        // Ensure data is stored in the correct file path
        const userDataPath = app.getPath('userData');
        this.storagePath = path.join(userDataPath, `${storeName}.json`);

        // Load existing data from storage
        this.load();
    }

    /**
     * Load data from disk
     */
    private load(): void {
        try {
            if (fs.existsSync(this.storagePath)) {
                const fileContent = fs.readFileSync(this.storagePath, 'utf-8');
                this.data = JSON.parse(fileContent);
            } else {
                this.data = {};
            }
            this.initialized = true;
        } catch (error) {
            console.error(`Error loading storage ${this.storeName}:`, error);
            this.data = {};
            this.initialized = true;
        }
    }

    /**
     * Save data to disk
     */
    private save(): void {
        try {
            const dirPath = path.dirname(this.storagePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            fs.writeFileSync(this.storagePath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error(`Error saving storage ${this.storeName}:`, error);
        }
    }

    /**
     * Check if a key exists
     * @param key Key to check
     * @returns true if the key exists
     */
    public has(key: string): boolean {
        if (!this.initialized) {
            this.load();
        }
        return key in this.data;
    }

    /**
     * Get a stored value
     * @param key Storage key
     * @returns Stored value, or undefined if it doesn't exist
     */
    public get<T>(key: string): T | undefined {
        if (!this.initialized) {
            this.load();
        }
        return this.data[key] as T;
    }

    /**
     * Set a stored value
     * @param key Storage key
     * @param value Value to store
     */
    public set<T>(key: string, value: T): void {
        if (!this.initialized) {
            this.load();
        }
        this.data[key] = value;
        this.save();
    }

    /**
     * Delete a stored key
     * @param key Key to delete
     * @returns Whether deletion was successful
     */
    public delete(key: string): boolean {
        if (!this.initialized) {
            this.load();
        }
        if (key in this.data) {
            delete this.data[key];
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Clear all stored data
     */
    public clear(): void {
        this.data = {};
        this.save();
    }

    /**
     * Get all stored keys
     * @returns Array of all keys
     */
    public keys(): string[] {
        if (!this.initialized) {
            this.load();
        }
        return Object.keys(this.data);
    }

    /**
     * Get all stored values
     * @returns Array of all values
     */
    public values<T>(): T[] {
        if (!this.initialized) {
            this.load();
        }
        return Object.values(this.data) as T[];
    }

    /**
     * Get all stored key-value pairs
     * @returns Object containing all key-value pairs
     */
    public getAll<T>(): Record<string, T> {
        if (!this.initialized) {
            this.load();
        }
        return this.data as Record<string, T>;
    }
} 