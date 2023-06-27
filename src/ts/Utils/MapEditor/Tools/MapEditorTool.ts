
export abstract class MapEditorTool {
    protected active: boolean;

    public abstract clear(): void;
    public abstract handleKeyDownEvent(key: string): void;
    public abstract activate(): void;
    public abstract isActive(): boolean;
}
