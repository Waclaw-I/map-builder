
export abstract class MapEditorTool {
    protected active: boolean;

    public abstract activate(activate: boolean): void;
    public abstract isActive(): boolean;
}
