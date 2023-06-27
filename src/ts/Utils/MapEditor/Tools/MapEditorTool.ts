
export abstract class MapEditorTool {
    protected active: boolean;

    public abstract handleKeyDownEvent(key: string): void;
    public abstract activate(activate: boolean): void;
    public abstract isActive(): boolean;
}
